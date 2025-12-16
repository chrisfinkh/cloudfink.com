import { ref } from "vue"
import { getDoc, doc } from "firebase/firestore"
import { db } from '../firebase/config'
import type { Post } from "@/types/Post"

const getPost = (id: string) => {
    const post = ref<Post>()
    const error = ref<string | null>(null)

    const load = async() => {
        try {
          const docRef = doc(db, "posts", id)
          const snapshot = await getDoc(docRef)

          if (!snapshot.exists()) {
            throw Error("That Post does not exist.")
          }
          post.value = { id: snapshot.id, ...snapshot.data() } as Post
        }
        catch(err) {
            const message = err instanceof Error ? err.message : String(err)
            error.value = message
            console.log(message);
        }
    }
    return { post, error, load}
}

export default getPost
