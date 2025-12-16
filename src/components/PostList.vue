<template lang="">
  <div class="postlist">
    <SinglePost v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>
<script setup lang="ts">
import SinglePost from './SinglePost.vue'
defineProps(['posts'])
</script>
<style lang=""></style>
