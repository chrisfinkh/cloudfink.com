import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { firebaseConfig } from '../src/firebase/firebaseConfig'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

type Post = {
  title: string
  body: string
  tags: string[]
}

async function clearPosts() {
  console.log('Clearing existing posts...')
  const snapshot = await getDocs(collection(db, 'posts'))
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
  console.log(`Deleted ${snapshot.docs.length} existing posts`)
}

async function seedPosts() {
  const dataPath = join(__dirname, '../data/db.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const posts: Post[] = data.posts

  console.log(`Seeding ${posts.length} posts...`)

  for (const post of posts) {
    const docRef = await addDoc(collection(db, 'posts'), {
      title: post.title,
      body: post.body,
      tags: post.tags,
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
