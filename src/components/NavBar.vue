<template>
  <header class="bg-white shadow-soft">
    <div class="container flex items-center justify-between py-4">
      <RouterLink :to="{ name: 'Home', params: { locale } }">
        <div class="flex items-center gap-1">
          <img src="/favicon.svg" alt="Cloudfink" class="h-12 w-12 -translate-y-[3px]" />
          <h1 class="text-2xl font-bold text-primary">cloudfink</h1>
        </div>
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
        <UserMenu v-else />
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
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import UserMenu from '@/components/UserMenu.vue'

const { locale: i18nLocale } = useI18n({ useScope: 'global' })
const route = useRoute()
const { isLoggedIn } = useAuth()

const locale = computed(() => (route.params.locale as string) || i18nLocale.value)
</script>
