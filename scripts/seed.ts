import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { firebaseConfig } from '../src/firebase/firebaseConfig'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Test user that owns all seeded posts
const TEST_USER = {
  uid: 'GU9bkkKKxvhcMBNtoC5iwXXwwgA2',
  email: 'testauthor@example.com',
  password: 'password123',
  displayName: 'Test Author',
  username: 'testauthor',
}

// Check if running against emulator
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.argv.includes('--emulator')

if (useEmulator) {
  // Set emulator hosts if --emulator flag used
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
  console.log(`🔧 Using Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`)
  console.log(`🔧 Using Auth emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)

  // Initialize without credentials for emulator
  initializeApp({ projectId: firebaseConfig.projectId })
} else {
  // Load service account key for production
  const serviceAccountPath = join(__dirname, '../serviceAccountKey.json')
  if (!existsSync(serviceAccountPath)) {
    console.error('Error: serviceAccountKey.json not found!')
    console.error('Download it from Firebase Console → Project Settings → Service Accounts')
    console.error('Or use --emulator flag to seed the emulator instead')
    process.exit(1)
  }

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
  console.log('🔥 Using production Firestore')

  initializeApp({
    credential: cert(serviceAccount)
  })
}

const db = getFirestore()
const auth = getAuth()

type Post = {
  title: string
  body: string
  tags: string[]
  authorId: string
}

async function clearPosts() {
  console.log('Clearing existing posts...')
  const snapshot = await db.collection('posts').get()
  const deletePromises = snapshot.docs.map((doc) => doc.ref.delete())
  await Promise.all(deletePromises)
  console.log(`Deleted ${snapshot.docs.length} existing posts`)
}

async function seedTestUser() {
  if (!useEmulator) {
    console.log('⚠️  Skipping test user creation (only for emulator)')
    return
  }

  console.log('Creating test user...')

  // Create user in Auth
  try {
    await auth.createUser({
      uid: TEST_USER.uid,
      email: TEST_USER.email,
      password: TEST_USER.password,
      displayName: TEST_USER.displayName,
    })
    console.log(`✅ Created auth user: ${TEST_USER.email}`)
  } catch (error: any) {
    if (error.code === 'auth/uid-already-exists') {
      console.log(`ℹ️  Auth user already exists: ${TEST_USER.email}`)
    } else {
      throw error
    }
  }

  // Create user profile in Firestore
  await db.collection('users').doc(TEST_USER.uid).set({
    username: TEST_USER.username,
    displayName: TEST_USER.displayName,
    createdAt: new Date(),
  })
  console.log(`✅ Created user profile: ${TEST_USER.username}`)

  // Claim username
  await db.collection('usernames').doc(TEST_USER.username).set({
    uid: TEST_USER.uid,
    createdAt: new Date(),
  })
  console.log(`✅ Claimed username: ${TEST_USER.username}`)
}

async function seedPosts() {
  const dataPath = join(__dirname, '../data/db.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const posts: Post[] = data.posts

  console.log(`Seeding ${posts.length} posts...`)

  for (const post of posts) {
    const docRef = await db.collection('posts').add({
      title: post.title,
      body: post.body,
      tags: post.tags,
      authorId: post.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`Created: ${post.title} (${docRef.id})`)
  }

  console.log('Seeding complete!')
}

async function main() {
  const args = process.argv.slice(2)
  const shouldClear = args.includes('--clear')

  if (shouldClear) {
    await clearPosts()
  }

  await seedTestUser()
  await seedPosts()
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
