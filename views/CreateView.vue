<template>
  <div>create</div>
  <form>
    <label for="title" required>Title</label>
    <input id="title" v-model="title" class="border-black-500 border"/>
    <label for="body">Content</label>
    <textarea id="body" v-model="body" class="border-black-500 border" required></textarea>
    <label for="tag">Tag (press enter to add tag)</label>
    <input
      type="text"
      id="tag"
      v-model="tag"
      class="border-black-500 border"
      @keydown.enter.prevent="handleKeydown"
      >
    <div v-for="tag in tags" :key="tag" class="pill"> #{{ tag }}</div>
    <button>Add Post</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref<string>('')
const body = ref<string>('')
const tag = ref<string>('')
const tags = ref<string[]>([])

const handleKeydown = () => {
  if (!tags.value.includes(tag.value)) {
    tag.value = tag.value.trim()
    tags.value.push(tag.value)
  }
  tag.value = ''

}


</script>
