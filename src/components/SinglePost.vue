<template>
  <article class="group rounded-lg bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lg">
    <div class="relative isolate flex h-full flex-col p-6">
      <h2 class="text-xl font-semibold text-surface-800">
        <RouterLink :to="{ name: 'Detail', params: { id: post.id } }">
          <span class="absolute inset-0 z-10" aria-hidden="true"></span>
          {{ post.title }}
        </RouterLink>
      </h2>

      <p class="mt-1 text-xs text-surface-400">{{ t('home.byAuthor', { author: authorName }) }}</p>

      <p class="mt-3 flex-1 text-surface-300">{{ snippet }}</p>

      <div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700"
        >
          #{{ tag }}
        </span>
      </div>

      <p class="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
        {{ t('home.readArticle') }} →
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Post } from '@/types/Post'

const { t } = useI18n()

const props = defineProps<{
  post: Post
  authorName: string
}>()

const snippet = computed(() => {
  return props.post.body.length > 100
    ? props.post.body.substring(0, 100) + '...'
    : props.post.body
})
</script>
