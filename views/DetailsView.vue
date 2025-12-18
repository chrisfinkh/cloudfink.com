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

      <div class="prose text-surface-800" v-html="renderedBody"></div>
      <button
          @click="deletePost"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100"
          title="Delete Post"
        >
          <TrashIcon class="h-5 w-5" />
          Delete
      </button>
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
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { VueSpinnerOval } from 'vue3-spinners'
import { TrashIcon } from '@heroicons/vue/24/outline'
import getPost from '@/composables/getPost'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import router from '@/router'

const props = defineProps<{
  id: string
}>()

const { post, error, load } = getPost(props.id)
load()

const renderedBody = computed(() => {
  if (!post.value?.body) return ''
  return DOMPurify.sanitize(marked.parse(post.value.body) as string)
})

const deletePost = async () => {
  await deleteDoc(doc(db, 'posts', props.id))
  router.push({ name: 'Home' })
}
</script>
