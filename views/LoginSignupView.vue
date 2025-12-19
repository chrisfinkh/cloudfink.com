<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-lg bg-white p-8 shadow-card">
      <h1 class="mb-6 text-2xl font-bold text-surface-800">
        {{ showLogin ? 'Login' : 'Sign Up' }}
      </h1>

      <LoginForm v-if="showLogin" />
      <SignupForm v-else />

      <p v-if="showLogin" class="mt-6 text-center text-surface-800">
        No account yet?
        <span
          class="cursor-pointer underline hover:text-primary"
          @click="showLogin = false"
        >
          Sign up
        </span>
      </p>
      <p v-else class="mt-6 text-center text-surface-800">
        Already registered?
        <span
          class="cursor-pointer underline hover:text-primary"
          @click="showLogin = true"
        >
          Login
        </span>
      </p>

      <div class="mt-6 flex items-center gap-4">
        <div class="h-px flex-1 bg-surface-200"></div>
        <span class="text-sm text-surface-300">or</span>
        <div class="h-px flex-1 bg-surface-200"></div>
      </div>

      <button
        @click="loginWithGoogle"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-300 py-2 transition-colors hover:bg-surface-50"
      >
        <img :src="googleLogo" class="h-5 w-5" alt="" />
        Continue with Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import SignupForm from '@/components/SignupForm.vue'
import { useAuth } from '@/composables/useAuth'
import googleLogo from '@/assets/google.svg'

const showLogin = ref<boolean>(true)
const router = useRouter()
const { login } = useAuth()

const loginWithGoogle = async () => {
  await login()
  router.push({ name: 'Home' })
}
</script>
