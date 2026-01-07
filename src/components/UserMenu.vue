<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-surface-800 transition-colors hover:bg-surface-100"
    >
      <UserCircleIcon class="h-6 w-6" />
      <ChevronDownIcon class="h-4 w-4" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="z-50 min-w-40 rounded-lg bg-white p-1 shadow-card"
        :side-offset="5"
      >
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-surface-800 outline-none hover:bg-surface-100 data-[highlighted]:bg-surface-100"
          @click="navigateTo('MyArticles')"
        >
          <DocumentTextIcon class="h-5 w-5" />
          <span>{{ $t('userMenu.myArticles') }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-surface-800 outline-none hover:bg-surface-100 data-[highlighted]:bg-surface-100"
          @click="navigateTo('MyAccount')"
        >
          <Cog6ToothIcon class="h-5 w-5" />
          <span>{{ $t('userMenu.myAccount') }}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator class="my-1 h-px bg-surface-200" />

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 data-[highlighted]:bg-red-50"
          @click="handleLogout"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
          <span>{{ $t('common.logout') }}</span>
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
  DropdownMenuItem,
  DropdownMenuSeparator
} from 'radix-vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import {
  UserCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const { showToast } = useToast()

const locale = computed(() => (route.params.locale as string) || 'en')

const navigateTo = (name: string) => {
  router.push({ name, params: { locale: locale.value } })
}

const handleLogout = async () => {
  await logout()
  showToast({
    title: t('toast.logoutSuccess.title'),
    description: t('toast.logoutSuccess.description'),
    type: 'info'
  })
  router.push({ name: 'Home', params: { locale: locale.value } })
}
</script>
