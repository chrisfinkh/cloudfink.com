import { ref } from "vue"
import { collection, getDocs } from "firebase/firestore"
import { db } from '../firebase/config'
import type { Post } from "@/types/Post"

const getPosts = () => {
    const posts = ref<Post[]>([])
    const error = ref<string | null>(null)

    const load = async() => {
        try {
          const snapshot = await getDocs(collection(db, 'posts'))
          posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
        }
        catch(err) {
            const message = err instanceof Error ? err.message : String(err)
            error.value = message
            console.log(message);
        }
    }
    return { posts, error, load}
}

export default getPosts
