<template>
  <div>
    <h1>Home</h1>
    <PostList v-if="posts.length" :posts="posts" class="text-indigo-500"></PostList>
    <VueSpinnerOval v-else :size="50" color="#35B6FF" class="" />
    <p v-if="error">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
import PostList from '@/components/PostList.vue'
import getPosts from '../src/composables/getPosts'
import { VueSpinnerOval } from 'vue3-spinners'

const { posts, error, load } = getPosts()
load()
</script>

