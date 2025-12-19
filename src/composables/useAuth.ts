import { ref, computed, onMounted } from 'vue'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth } from '@/firebase/config'

const user = ref<User | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Listen to auth state changes (runs once, shared across all components)
let initialized = false
const initAuth = () => {
  if (initialized) return
  initialized = true
  onAuthStateChanged(auth, (u) => {
    user.value = u
    isLoading.value = false
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
    } catch (e) {
      error.value = (e as Error).message
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

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    logout
  }
}
