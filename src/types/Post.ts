import type { Timestamp } from 'firebase/firestore'

export type Post = {
  id: string
  title: string
  body: string
  tags: string[]
  authorId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
