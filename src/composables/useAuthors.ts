import { ref, watch, type Ref } from 'vue'
import { doc, getDoc, query, collection, where, documentId, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Post } from '@/types/Post'

export type Author = {
  uid: string
  displayName: string
  username: string
}

// Cache to avoid refetching the same authors
const authorCache = new Map<string, Author>()

/**
 * Fetch a single author by ID
 */
export const useAuthor = (authorId: Ref<string | undefined>) => {
  const author = ref<Author | null>(null)
  const isLoading = ref(false)

  watch(authorId, async (id) => {
    if (!id) {
      author.value = null
      return
    }

    // Check cache first
    if (authorCache.has(id)) {
      author.value = authorCache.get(id)!
      return
    }

    isLoading.value = true
    try {
      const userDoc = await getDoc(doc(db, 'users', id))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const authorData: Author = {
          uid: id,
          displayName: data.displayName || 'Unknown',
          username: data.username || ''
        }
        authorCache.set(id, authorData)
        author.value = authorData
      } else {
        author.value = { uid: id, displayName: 'Unknown', username: '' }
      }
    } catch (err) {
      console.error('Error fetching author:', err)
      author.value = { uid: id, displayName: 'Unknown', username: '' }
    } finally {
      isLoading.value = false
    }
  }, { immediate: true })

  return { author, isLoading }
}

/**
 * Batch fetch authors for a list of posts
 * Returns a Map of authorId -> Author
 */
export const useAuthors = (posts: Ref<Post[]>) => {
  const authors = ref<Map<string, Author>>(new Map())
  const isLoading = ref(false)

  watch(posts, async (postList) => {
    if (!postList.length) {
      authors.value = new Map()
      return
    }

    // Get unique author IDs not already in cache
    const allAuthorIds = [...new Set(postList.map(p => p.authorId))]
    const uncachedIds = allAuthorIds.filter(id => !authorCache.has(id))

    // Start with cached authors
    const result = new Map<string, Author>()
    allAuthorIds.forEach(id => {
      if (authorCache.has(id)) {
        result.set(id, authorCache.get(id)!)
      }
    })

    // Fetch uncached authors
    if (uncachedIds.length > 0) {
      isLoading.value = true
      try {
        // Firestore 'in' query supports up to 30 items
        const chunks = []
        for (let i = 0; i < uncachedIds.length; i += 30) {
          chunks.push(uncachedIds.slice(i, i + 30))
        }

        for (const chunk of chunks) {
          const q = query(
            collection(db, 'users'),
            where(documentId(), 'in', chunk)
          )
          const snapshot = await getDocs(q)

          snapshot.docs.forEach(doc => {
            const data = doc.data()
            const authorData: Author = {
              uid: doc.id,
              displayName: data.displayName || 'Unknown',
              username: data.username || ''
            }
            authorCache.set(doc.id, authorData)
            result.set(doc.id, authorData)
          })

          // Handle authors not found in users collection
          chunk.forEach(id => {
            if (!result.has(id)) {
              const unknown: Author = { uid: id, displayName: 'Unknown', username: '' }
              authorCache.set(id, unknown)
              result.set(id, unknown)
            }
          })
        }
      } catch (err) {
        console.error('Error fetching authors:', err)
      } finally {
        isLoading.value = false
      }
    }

    authors.value = result
  }, { immediate: true })

  return { authors, isLoading }
}
