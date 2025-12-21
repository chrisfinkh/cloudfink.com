<template>
  <header class="bg-white shadow-soft">
    <div class="container flex items-center justify-between py-4">
      <RouterLink :to="{ name: 'Home' }">
        <h1 class="text-2xl font-bold text-primary">C529 Blog</h1>
      </RouterLink>
      <nav class="flex items-center gap-6">
        <RouterLink
          :to="{ name: 'Home' }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Home
        </RouterLink>
        <RouterLink
          v-if="isLoggedIn"
          :to="{ name: 'Create' }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Create
        </RouterLink>
        <RouterLink
          v-if="!isLoggedIn"
          :to="{ name: 'Login' }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Login
        </RouterLink>
        <button
          v-else
          @click="handleLogout"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { isLoggedIn, logout } = useAuth()
const { showToast } = useToast()

const handleLogout = async () => {
  await logout()
  showToast({
    title: 'Goodbye!',
    description: 'You have been logged out.',
    type: 'info'
  })
}
</script>
