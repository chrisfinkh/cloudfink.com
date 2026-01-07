import { ref, computed, onMounted } from 'vue'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  deleteUser,
  type User,
  type AuthError
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

// Map Firebase error codes to user-friendly messages
const getAuthErrorMessage = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials or sign up for a new account.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please log in instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.'
  }

  return errorMessages[error.code] || error.message
}

const user = ref<User | null>(null)
const username = ref<string | null>(null)
const isAdmin = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Promise that resolves when auth state change is fully processed
let authStateResolve: (() => void) | null = null
let authStatePromise: Promise<void> | null = null

// Listen to auth state changes (runs once, shared across all components)
let initialized = false
const initAuth = () => {
  if (initialized) return
  initialized = true
  onAuthStateChanged(auth, async (u) => {
    // Create a new promise for this auth state change
    authStatePromise = new Promise((resolve) => {
      authStateResolve = resolve
    })

    user.value = u
    if (u) {
      // Fetch username and isAdmin from Firestore
      const userDoc = await getDoc(doc(db, 'users', u.uid))
      if (userDoc.exists()) {
        username.value = userDoc.data().username || null
        isAdmin.value = userDoc.data().isAdmin === true
      } else {
        username.value = null
        isAdmin.value = false
      }
    } else {
      username.value = null
      isAdmin.value = false
    }
    isLoading.value = false

    // Resolve the promise now that auth state is fully processed
    if (authStateResolve) {
      authStateResolve()
      authStateResolve = null
    }
  })
}

export const useAuth = () => {
  onMounted(() => initAuth())

  const isLoggedIn = computed(() => !!user.value)

  const login = async () => {
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      // Wait for auth state to be fully processed (including username fetch)
      if (authStatePromise) {
        await authStatePromise
      }
    } catch (e) {
      error.value = getAuthErrorMessage(e as AuthError)
      console.error('Login error:', e)
    }
  }

  const logout = async () => {
    error.value = null
    try {
      await signOut(auth)
    } catch (e) {
      error.value = (e as Error).message
      console.error('Logout error:', e)
    }
  }

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (e) {
      error.value = getAuthErrorMessage(e as AuthError)
      console.error('Login error:', e)
      return false
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<boolean> => {
    error.value = null
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      return true
    } catch (e) {
      error.value = getAuthErrorMessage(e as AuthError)
      console.error('Signup error:', e)
      return false
    }
  }

  // Check if a username is available
  const isUsernameAvailable = async (name: string): Promise<boolean> => {
    const usernameDoc = await getDoc(doc(db, 'usernames', name.toLowerCase()))
    return !usernameDoc.exists()
  }

  // Claim a username for the current user
  const claimUsername = async (name: string): Promise<boolean> => {
    error.value = null
    if (!user.value) {
      error.value = 'Must be logged in to claim username'
      return false
    }

    const lowerName = name.toLowerCase()

    try {
      // Check availability first
      if (!(await isUsernameAvailable(lowerName))) {
        error.value = 'Username is already taken'
        return false
      }

      // Save to usernames collection (for uniqueness lookup)
      await setDoc(doc(db, 'usernames', lowerName), {
        uid: user.value.uid,
        createdAt: serverTimestamp()
      })

      // Save to users collection (for user profile)
      // Note: email not stored here - it's private in Firebase Auth
      await setDoc(doc(db, 'users', user.value.uid), {
        username: lowerName,
        displayName: name,
        createdAt: serverTimestamp()
      })

      // Update local state
      username.value = lowerName

      return true
    } catch (e) {
      error.value = (e as Error).message
      console.error('Claim username error:', e)
      return false
    }
  }

  // Check if current user needs to set a username
  const needsUsername = computed(() => isLoggedIn.value && !username.value)

  // Delete user account and all associated data
  const deleteAccount = async (): Promise<boolean> => {
    error.value = null
    if (!user.value) {
      error.value = 'Must be logged in to delete account'
      return false
    }

    try {
      const uid = user.value.uid
      const currentUsername = username.value
      const batch = writeBatch(db)

      // Delete all posts by this user
      const postsQuery = query(collection(db, 'posts'), where('authorId', '==', uid))
      const postsSnapshot = await getDocs(postsQuery)
      postsSnapshot.docs.forEach((postDoc) => {
        batch.delete(postDoc.ref)
      })

      // Delete username document
      if (currentUsername) {
        batch.delete(doc(db, 'usernames', currentUsername))
      }

      // Delete user document
      batch.delete(doc(db, 'users', uid))

      // Commit batch delete
      await batch.commit()

      // Delete Firebase Auth user
      await deleteUser(user.value)

      return true
    } catch (e) {
      error.value = (e as Error).message
      console.error('Delete account error:', e)
      return false
    }
  }

  return {
    user,
    username,
    isAdmin,
    isLoggedIn,
    isLoading,
    error,
    needsUsername,
    login,
    logout,
    loginWithEmail,
    signUpWithEmail,
    isUsernameAvailable,
    claimUsername,
    deleteAccount
  }
}
