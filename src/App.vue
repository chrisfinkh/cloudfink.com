<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans">
    <NavBar />
    <main class="container py-8">
      <RouterView />
    </main>
  </div>
</template>
