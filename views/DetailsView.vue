<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink
      :to="{ name: 'Home' }"
      class="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-600"
    >
      <span aria-hidden="true">←</span>
      Back to posts
    </RouterLink>

    <article v-if="post" class="rounded-lg bg-white p-8 shadow-card">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-surface-800">{{ post.title }}</h1>
        <div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
          >
            #{{ tag }}
          </span>
        </div>
      </header>

      <div class="prose text-surface-800">
        <p class="whitespace-pre-wrap leading-relaxed">{{ post.body }}</p>
      </div>
    </article>

    <div v-else-if="!error" class="flex justify-center py-12">
      <VueSpinnerOval :size="50" color="var(--color-primary-400)" />
    </div>

    <div v-if="error" class="rounded-lg bg-red-50 p-6 text-center">
      <p class="text-red-600">{{ error }}</p>
      <RouterLink
        :to="{ name: 'Home' }"
        class="mt-4 inline-block text-primary hover:text-primary-600"
      >
        Return to home
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueSpinnerOval } from 'vue3-spinners'
import getPost from '@/composables/getPost'

const props = defineProps<{
  id: string
}>()

const { post, error, load } = getPost(props.id)
load()
</script>
