<template>
  <header class="bg-white shadow-soft">
    <div class="container flex items-center justify-between py-4">
      <h1 class="text-2xl font-bold text-primary">Blog</h1>
      <nav class="flex gap-6">
        <RouterLink
          :to="{ name: 'Home' }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Home
        </RouterLink>
        <RouterLink
          :to="{ name: 'Create' }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Create
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts"></script>
