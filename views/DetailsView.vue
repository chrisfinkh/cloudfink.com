<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink
      :to="{ name: 'Home', params: { locale: $route.params.locale } }"
      class="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-600"
    >
      <span aria-hidden="true">←</span>
      {{ $t('detail.backToPosts') }}
    </RouterLink>

    <article v-if="post" class="rounded-lg bg-white p-8 shadow-card">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-surface-800">{{ post.title }}</h1>
        <p class="mt-2 text-sm text-surface-500">
          by {{ author?.displayName || 'Unknown' }}
        </p>
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

      <!-- Delete button: only show when logged in -->
      <button
        v-if="isLoggedIn"
        @click="deletePost"
        :disabled="!isAuthor"
        :class="[
          'mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors',
          isAuthor
            ? 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        ]"
        :title="isAuthor ? 'Delete Post' : 'Only the author can delete this post'"
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
        :to="{ name: 'Home', params: { locale: $route.params.locale } }"
        class="mt-4 inline-block text-primary hover:text-primary-600"
      >
        {{ $t('detail.returnToHome') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { VueSpinnerOval } from 'vue3-spinners'
import { TrashIcon } from '@heroicons/vue/24/outline'
import getPost from '@/composables/getPost'
import { useAuth } from '@/composables/useAuth'
import { useAuthor } from '@/composables/useAuthors'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const router = useRouter()

const { post, error, load } = getPost(props.id)
load()

const { user, isLoggedIn } = useAuth()

const authorId = computed(() => post.value?.authorId)
const { author } = useAuthor(authorId)

const isAuthor = computed(() => {
  return user.value && post.value && user.value.uid === post.value.authorId
})

const renderedBody = computed(() => {
  if (!post.value?.body) return ''
  return DOMPurify.sanitize(marked.parse(post.value.body) as string)
})

const deletePost = async () => {
  await deleteDoc(doc(db, 'posts', props.id))
  router.push({ name: 'Home', params: { locale: route.params.locale } })
}
</script>
