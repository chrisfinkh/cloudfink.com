import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load service account key
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json')
if (!existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found!')
  console.error('Download it from Firebase Console → Project Settings → Service Accounts')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

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

  await seedPosts()
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
