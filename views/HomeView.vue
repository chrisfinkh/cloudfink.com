<template>
  <div>
    <h1 class="mb-8 text-3xl font-bold text-surface-800">Latest Posts</h1>
    <FilterNav
      v-if="allTags.length"
      :tags="allTags"
      :current="activeTag"
      @filter-changed="handleFilterChange"
    />
    <PostList v-if="filteredPosts.length" :posts="filteredPosts" />
    <div v-else-if="loading" class="flex justify-center py-12">
      <VueSpinnerOval :size="50" color="var(--color-primary-400)" />
    </div>
    <p v-else-if="!loading && !filteredPosts.length" class="text-surface-500">
      No posts found for this tag.
    </p>
    <p v-if="error" class="mt-4 rounded bg-red-50 p-3 text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostList from '@/components/PostList.vue'
import FilterNav from '@/components/FilterNav.vue'
import getPosts from '../src/composables/getPosts'
import { VueSpinnerOval } from 'vue3-spinners'

const route = useRoute()
const router = useRouter()

const { posts, error, load } = getPosts()
const loading = ref(true)

load().then(() => {
  loading.value = false
})

const activeTag = computed(() => {
  const tag = route.query.tag
  return typeof tag === 'string' ? tag : null
})

const allTags = computed(() => {
  const tagSet = new Set<string>()
  posts.value.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

const filteredPosts = computed(() => {
  if (!activeTag.value) {
    return posts.value
  }
  return posts.value.filter((post) => post.tags.includes(activeTag.value!))
})

const handleFilterChange = (tag: string | null) => {
  if (tag) {
    router.push({ query: { tag } })
  } else {
    router.push({ query: {} })
  }
}
</script>

