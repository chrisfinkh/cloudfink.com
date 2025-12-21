<template>
  <header class="bg-white shadow-soft">
    <div class="container flex items-center justify-between py-4">
      <RouterLink :to="{ name: 'Home', params: { locale } }">
        <h1 class="text-2xl font-bold text-primary">C529 Blog</h1>
      </RouterLink>
      <nav class="flex items-center gap-6">
        <RouterLink
          :to="{ name: 'Home', params: { locale } }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          {{ $t('common.home') }}
        </RouterLink>
        <RouterLink
          v-if="isLoggedIn"
          :to="{ name: 'Create', params: { locale } }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          {{ $t('common.create') }}
        </RouterLink>
        <RouterLink
          v-if="!isLoggedIn"
          :to="{ name: 'Login', params: { locale } }"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          {{ $t('common.login') }}
        </RouterLink>
        <button
          v-else
          @click="handleLogout"
          class="text-surface-800 transition-colors hover:text-primary"
        >
          {{ $t('common.logout') }}
        </button>
        <LanguageSwitch />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })
const route = useRoute()
const { isLoggedIn, logout } = useAuth()
const { showToast } = useToast()

const locale = computed(() => (route.params.locale as string) || i18nLocale.value)

const handleLogout = async () => {
  await logout()
  showToast({
    title: t('toast.logoutSuccess.title'),
    description: t('toast.logoutSuccess.description'),
    type: 'info'
  })
}
</script>
