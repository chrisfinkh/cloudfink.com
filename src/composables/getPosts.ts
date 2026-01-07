import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Post } from '@/types/Post'

export interface GetPostsOptions {
  // Only show published posts (for public home page)
  publishedOnly?: boolean
  // Only show posts by this author (for My Articles)
  authorId?: string
}

const getPosts = (options: GetPostsOptions = {}) => {
  const posts = ref<Post[]>([])
  const error = ref<string | null>(null)

  const load = async () => {
    try {
      const q = collection(db, 'posts')
      const constraints = []

      if (options.publishedOnly) {
        constraints.push(where('status', '==', 'published'))
      }

      if (options.authorId) {
        constraints.push(where('authorId', '==', options.authorId))
      }

      const finalQuery = constraints.length > 0 ? query(q, ...constraints) : q
      const snapshot = await getDocs(finalQuery)
      posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      console.log(message)
    }
  }
  return { posts, error, load }
}

export default getPosts
