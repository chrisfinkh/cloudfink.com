<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <SinglePost
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :author-name="authors.get(post.authorId)?.displayName || 'Unknown'"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import SinglePost from './SinglePost.vue'
import { useAuthors } from '@/composables/useAuthors'
import type { Post } from '@/types/Post'

const props = defineProps<{
  posts: Post[]
}>()

const { authors } = useAuthors(toRef(props, 'posts'))
</script>
