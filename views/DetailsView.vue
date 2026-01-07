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
        <div v-if="isAuthor && post.status === 'pending'" class="mb-3">
          <StatusBadge :status="post.status" />
        </div>
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

      <div v-if="isLoggedIn" class="mt-6 flex gap-3">
        <RouterLink
          :to="{ name: 'Edit', params: { locale: $route.params.locale, id: id } }"
          class="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
          :class="isAuthor
            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            : 'cursor-not-allowed bg-surface-100 text-surface-400'"
          :title="$t('detail.edit')"
          :aria-disabled="!isAuthor"
          @click.prevent="isAuthor ? $router.push({ name: 'Edit', params: { locale: $route.params.locale, id: id } }) : null"
        >
          <PencilIcon class="h-5 w-5" />
          {{ $t('detail.edit') }}
        </RouterLink>
        <button
          @click="deletePost"
          class="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
          :class="isAuthor
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'cursor-not-allowed bg-surface-100 text-surface-400'"
          :title="$t('detail.delete')"
          :disabled="!isAuthor"
        >
          <TrashIcon class="h-5 w-5" />
          {{ $t('detail.delete') }}
        </button>
      </div>
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
import { TrashIcon, PencilIcon } from '@heroicons/vue/24/outline'
import getPost from '@/composables/getPost'
import { useAuth } from '@/composables/useAuth'
import { useAuthor } from '@/composables/useAuthors'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import StatusBadge from '@/components/StatusBadge.vue'

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
  return isLoggedIn.value && post.value?.authorId === user.value?.uid
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
