import type { Timestamp } from 'firebase/firestore'

export type Post = {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
