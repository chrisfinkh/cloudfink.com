<template>
  <nav class="mb-8 flex gap-2 overflow-x-auto scrollbar-none">
    <button
      @click="emit('filterChanged', null)"
      :class="[
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        props.current === null
          ? 'bg-primary-400 text-white'
          : 'bg-surface-200 text-surface-600 hover:bg-surface-300',
      ]"
    >
      All
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      @click="emit('filterChanged', tag)"
      :class="[
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        props.current === tag
          ? 'bg-primary-400 text-white'
          : 'bg-surface-200 text-surface-600 hover:bg-surface-300',
      ]"
    >
      {{ tag }}
    </button>
  </nav>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  filterChanged: [tag: string | null]
}>()

const props = defineProps<{
  tags: string[]
  current: string | null
}>()
</script>
