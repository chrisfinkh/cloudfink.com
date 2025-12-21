<template>
  <div class="mx-auto max-w-2xl">
    <RouterLink
      :to="{ name: 'Detail', params: { locale: $route.params.locale, id: id } }"
      class="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-600"
    >
      <span aria-hidden="true">&larr;</span>
      {{ $t('detail.backToPosts') }}
    </RouterLink>

    <h1 class="mb-8 text-3xl font-bold text-surface-800">{{ $t('editPost.title') }}</h1>

    <div v-if="loadError" class="rounded-lg bg-red-50 p-6 text-center">
      <p class="text-red-600">{{ loadError }}</p>
      <RouterLink
        :to="{ name: 'Home', params: { locale: $route.params.locale } }"
        class="mt-4 inline-block text-primary hover:text-primary-600"
      >
        {{ $t('detail.returnToHome') }}
      </RouterLink>
    </div>

    <div v-else-if="!post" class="flex justify-center py-12">
      <VueSpinnerOval :size="50" color="var(--color-primary-400)" />
    </div>

    <FormKit
      v-else
      type="form"
      :actions="false"
      form-class="space-y-6 rounded-lg bg-white p-6 shadow-card sm:p-8"
      @submit="handleSubmit"
    >
      <FormKit
        type="text"
        name="title"
        :label="$t('editPost.postTitle')"
        :placeholder="$t('editPost.postTitlePlaceholder')"
        :value="post.title"
        validation="required|length:3,100"
        validation-visibility="blur"
      />

      <FormKit
        type="textarea"
        name="body"
        :label="$t('editPost.content')"
        :placeholder="$t('editPost.contentPlaceholder')"
        :value="post.body"
        validation="required|length:10"
        validation-visibility="blur"
      />

      <div class="mb-5">
        <label for="tag" class="mb-1 block font-medium text-surface-800">
          {{ $t('editPost.tags') }}
        </label>
        <input
          id="tag"
          v-model="tag"
          type="text"
          class="w-full rounded border border-surface-300 px-4 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          :placeholder="$t('editPost.tagsPlaceholder')"
          @keydown.enter.prevent="addTag"
        />
        <div v-if="tags.length" class="flex flex-wrap gap-2 pt-3">
          <span
            v-for="t in tags"
            :key="t"
            class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
          >
            #{{ t }}
            <button
              type="button"
              class="ml-1 hover:text-primary-900"
              @click="removeTag(t)"
            >
              &times;
            </button>
          </span>
        </div>
      </div>

      <div v-if="error" class="rounded bg-red-50 p-3 text-red-600">
        {{ error }}
      </div>

      <FormKit type="submit" :label="isPending ? $t('common.saving') : $t('common.saveChanges')" :disabled="isPending" />
    </FormKit>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueSpinnerOval } from 'vue3-spinners'
import getPost from '@/composables/getPost'
import useEditPost from '@/composables/useEditPost'

interface FormData {
  title: string
  body: string
}

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const router = useRouter()
const { error, isPending, editPost } = useEditPost()
const { post, error: loadError, load } = getPost(props.id)

const tag = ref<string>('')
const tags = ref<string[]>([])

onMounted(async () => {
  await load()
  if (post.value?.tags) {
    tags.value = [...post.value.tags]
  }
})

const addTag = () => {
  const trimmed = tag.value.trim()
  if (trimmed && !tags.value.includes(trimmed)) {
    tags.value.push(trimmed)
  }
  tag.value = ''
}

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter((t) => t !== tagToRemove)
}

const handleSubmit = async (data: FormData) => {
  const success = await editPost(props.id, {
    title: data.title,
    body: data.body,
    tags: tags.value,
  })

  if (success) {
    router.push({ name: 'Detail', params: { locale: route.params.locale, id: props.id } })
  }
}
</script>
