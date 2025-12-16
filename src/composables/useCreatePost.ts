import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Post } from '@/types/Post'

type NewPost = Omit<Post, 'id'>

const useCreatePost = () => {
  const error = ref<string | null>(null)
  const isPending = ref(false)

  const createPost = async (post: NewPost): Promise<string | null> => {
    error.value = null
    isPending.value = true

    try {
      const docRef = await addDoc(collection(db, 'posts'), post)
      isPending.value = false
      return docRef.id
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      isPending.value = false
      console.error('Error creating post:', message)
      return null
    }
  }

  return { error, isPending, createPost }
}

export default useCreatePost
