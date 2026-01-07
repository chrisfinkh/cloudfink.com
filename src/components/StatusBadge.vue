<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
      status === 'published'
        ? 'bg-green-600'
        : 'bg-amber-500'
    ]"
  >
    {{ status === 'published' ? $t('status.published') : $t('status.pending') }}
  </span>
</template>

<script setup lang="ts">
import type { PostStatus } from '@/types/Post'

defineProps<{
  status: PostStatus
}>()
</script>
