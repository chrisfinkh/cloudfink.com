<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <SinglePost v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup lang="ts">
import SinglePost from './SinglePost.vue'
import type { Post } from '@/types/Post'

defineProps<{
  posts: Post[]
}>()
</script>
