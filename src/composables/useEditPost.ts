import { ref } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import type { Post } from '@/types/Post'

type EditPost = Pick<Post, 'title' | 'body' | 'tags'>

const useEditPost = () => {
  const error = ref<string | null>(null)
  const isPending = ref(false)

  const editPost = async (postId: string, post: EditPost): Promise<boolean> => {
    error.value = null
    isPending.value = true

    if (!auth.currentUser) {
      error.value = 'You must be logged in to edit a post'
      isPending.value = false
      return false
    }

    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...post,
        updatedAt: serverTimestamp(),
      })
      isPending.value = false
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      isPending.value = false
      console.error('Error editing post:', message)
      return false
    }
  }

  return { error, isPending, editPost }
}

export default useEditPost
