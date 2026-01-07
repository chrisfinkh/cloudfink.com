<template>
  <div>
    <h1 class="mb-8 text-3xl font-bold text-surface-800">{{ $t('myArticles.title') }}</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <VueSpinnerOval :size="50" color="var(--color-primary-400)" />
    </div>

    <div v-else-if="posts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="post in posts"
        :key="post.id"
        class="group rounded-lg bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="relative isolate flex h-full flex-col p-6">
          <div class="mb-2">
            <StatusBadge :status="post.status" />
          </div>

          <h2 class="text-xl font-semibold text-surface-800">
            <RouterLink :to="{ name: 'Detail', params: { id: post.id, locale: $route.params.locale } }">
              <span class="absolute inset-0 z-10" aria-hidden="true"></span>
              {{ post.title }}
            </RouterLink>
          </h2>

          <p class="mt-3 flex-1 text-surface-300">{{ getSnippet(post.body) }}</p>

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
            {{ $t('myArticles.viewArticle') }} →
          </p>
        </div>
      </article>
    </div>

    <div v-else class="rounded-lg bg-white p-8 text-center shadow-card">
      <p class="text-surface-500">{{ $t('myArticles.noArticles') }}</p>
      <RouterLink
        :to="{ name: 'Create', params: { locale: $route.params.locale } }"
        class="mt-4 inline-block text-primary hover:text-primary-600"
      >
        {{ $t('myArticles.createFirst') }}
      </RouterLink>
    </div>

    <p v-if="error" class="mt-4 rounded bg-red-50 p-3 text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueSpinnerOval } from 'vue3-spinners'
import getPosts from '@/composables/getPosts'
import { useAuth } from '@/composables/useAuth'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Post } from '@/types/Post'

const { user, isLoading: authLoading } = useAuth()

const posts = ref<Post[]>([])
const error = ref<string | null>(null)
const loading = ref(true)

const getSnippet = (body: string) => {
  return body.length > 100 ? body.substring(0, 100) + '...' : body
}

// Watch for auth to be ready, then load posts
watch(
  [() => user.value, () => authLoading.value],
  async ([currentUser, isAuthLoading]) => {
    if (isAuthLoading) return
    if (!currentUser) {
      loading.value = false
      return
    }

    const { posts: fetchedPosts, error: fetchError, load } = getPosts({ authorId: currentUser.uid })
    await load()
    posts.value = fetchedPosts.value
    error.value = fetchError.value
    loading.value = false
  },
  { immediate: true }
)
</script>
