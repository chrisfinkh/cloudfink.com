<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-lg bg-white p-8 shadow-card">
      <h1 class="mb-6 text-2xl font-bold text-surface-800">
        {{ showLogin ? $t('common.login') : $t('common.signup') }}
      </h1>

      <LoginForm v-if="showLogin" />
      <SignupForm v-else />

      <p v-if="showLogin" class="mt-6 text-center text-surface-800">
        {{ $t('auth.noAccount') }}
        <span
          class="cursor-pointer underline hover:text-primary"
          @click="showLogin = false"
        >
          {{ $t('common.signup') }}
        </span>
      </p>
      <p v-else class="mt-6 text-center text-surface-800">
        {{ $t('auth.alreadyRegistered') }}
        <span
          class="cursor-pointer underline hover:text-primary"
          @click="showLogin = true"
        >
          {{ $t('common.login') }}
        </span>
      </p>

      <div class="mt-6 flex items-center gap-4">
        <div class="h-px flex-1 bg-surface-200"></div>
        <span class="text-sm text-surface-300">{{ $t('common.or') }}</span>
        <div class="h-px flex-1 bg-surface-200"></div>
      </div>

      <button
        @click="loginWithGoogle"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-300 py-2 transition-colors hover:bg-surface-50"
      >
        <img :src="googleLogo" class="h-5 w-5" alt="" />
        {{ $t('auth.continueWithGoogle') }}
      </button>
    </div>

    <SetUsernameModal
      v-if="showUsernameModal"
      @complete="onUsernameSet"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import SignupForm from '@/components/SignupForm.vue'
import SetUsernameModal from '@/components/SetUsernameModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import googleLogo from '@/assets/google.svg'

const { t } = useI18n()
const route = useRoute()
const showLogin = ref<boolean>(true)
const showUsernameModal = ref(false)
const router = useRouter()
const { login, needsUsername, isLoggedIn } = useAuth()
const { showToast } = useToast()

const loginWithGoogle = async () => {
  await login()

  // Check if user needs to set a username (new Google user)
  if (needsUsername.value) {
    showUsernameModal.value = true
  } else if (isLoggedIn.value) {
    showToast({
      title: t('toast.loginGoogleSuccess.title'),
      description: t('toast.loginGoogleSuccess.description'),
      type: 'success'
    })
    router.push({ name: 'Home', params: { locale: route.params.locale } })
  }
}

const onUsernameSet = () => {
  showUsernameModal.value = false
  showToast({
    title: t('toast.usernameSetSuccess.title'),
    description: t('toast.usernameSetSuccess.description'),
    type: 'success'
  })
  router.push({ name: 'Home', params: { locale: route.params.locale } })
}
</script>
