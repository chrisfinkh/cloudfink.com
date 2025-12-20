<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-surface-800 transition-colors hover:bg-surface-100"
    >
      <LanguageIcon class="h-5 w-5" />
      <ChevronDownIcon class="h-4 w-4" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="z-50 min-w-32 rounded-lg bg-white p-1 shadow-card"
        :side-offset="5"
      >
        <DropdownMenuItem
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc.code"
          class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-surface-800 outline-none hover:bg-surface-100 data-[highlighted]:bg-surface-100"
          @click="setLocale(loc.code)"
        >
          <img :src="flagUrls[loc.country]" :alt="loc.name" class="h-5 w-5" />
          <span>{{ loc.name }}</span>
          <CheckIcon v-if="locale === loc.code" class="ml-auto h-4 w-4 text-primary" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem
} from 'radix-vue'
import { ChevronDownIcon, CheckIcon, LanguageIcon } from '@heroicons/vue/20/solid'
import { SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'

// Pre-load flags at module level (only once)
const flagUrls: Record<string, string> = Object.fromEntries(
  SUPPORTED_LOCALES.map((loc) => [
    loc.country,
    new URL(`../../node_modules/circle-flags/flags/${loc.country}.svg`, import.meta.url).href
  ])
)

const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

const currentLocale = computed(() =>
  SUPPORTED_LOCALES.find((l) => l.code === locale.value)
)

const setLocale = (code: LocaleCode) => {
  const currentPath = route.fullPath
  const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${code}`)
  router.push(newPath)
}
</script>
