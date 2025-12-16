<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-8 text-3xl font-bold text-surface-800">Create Post</h1>

    <FormKit
      type="form"
      :actions="false"
      form-class="space-y-6 rounded-lg bg-white p-6 shadow-card sm:p-8"
      @submit="handleSubmit"
    >
      <FormKit
        type="text"
        name="title"
        label="Title"
        placeholder="Enter post title"
        validation="required|length:3,100"
        validation-visibility="blur"
      />

      <FormKit
        type="textarea"
        name="body"
        label="Content"
        placeholder="Write your post content..."
        validation="required|length:10"
        validation-visibility="blur"
      />

      <div class="mb-5">
        <label for="tag" class="mb-1 block font-medium text-surface-800">
          Tags
        </label>
        <input
          id="tag"
          v-model="tag"
          type="text"
          class="w-full rounded border border-surface-300 px-4 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Press Enter to add a tag"
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
              ×
            </button>
          </span>
        </div>
      </div>

      <div v-if="error" class="rounded bg-red-50 p-3 text-red-600">
        {{ error }}
      </div>

      <FormKit type="submit" :label="isPending ? 'Saving...' : 'Add Post'" :disabled="isPending" />
    </FormKit>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useCreatePost from '@/composables/useCreatePost'

interface FormData {
  title: string
  body: string
}

const router = useRouter()
const { error, isPending, createPost } = useCreatePost()

const tag = ref<string>('')
const tags = ref<string[]>([])

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
  const postId = await createPost({
    title: data.title,
    body: data.body,
    tags: tags.value,
  })

  if (postId) {
    router.push({ name: 'Home' })
  }
}
</script>
