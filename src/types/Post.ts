import type { Timestamp } from 'firebase/firestore'

export type PostStatus = 'pending' | 'published'

export type Post = {
  id: string
  title: string
  body: string
  tags: string[]
  authorId: string
  status: PostStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}
