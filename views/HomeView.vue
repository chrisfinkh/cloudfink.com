<template>
  <div>
    <h1 class="mb-8 text-3xl font-bold text-surface-800">Latest Posts</h1>
    <PostList v-if="posts.length" :posts="posts" />
    <div v-else class="flex justify-center py-12">
      <VueSpinnerOval :size="50" color="#35B6FF" />
    </div>
    <p v-if="error" class="mt-4 rounded bg-red-50 p-3 text-red-600">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
import PostList from '@/components/PostList.vue'
import getPosts from '../src/composables/getPosts'
import { VueSpinnerOval } from 'vue3-spinners'

const { posts, error, load } = getPosts()
load()
</script>

