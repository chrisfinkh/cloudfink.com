<template>
  <div>
    <div v-if="post">
      <h2>{{ post.title }}</h2>
      <p>{{ post.body }}</p>
    </div>
    <VueSpinnerCircle v-else-if="!error" :size="50" color="#35B6FF" />
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { VueSpinnerCircle } from 'vue3-spinners'
import getPost from '@/composables/getPost'

const props = defineProps(['id'])
const { post, error, load } = getPost(props.id)
load()
</script>
