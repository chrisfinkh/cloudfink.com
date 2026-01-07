<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-8 text-3xl font-bold text-surface-800">{{ $t('myAccount.title') }}</h1>

    <div class="rounded-lg bg-white p-6 shadow-card sm:p-8">
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-surface-800">{{ $t('myAccount.accountInfo') }}</h2>
        <div class="mt-4 space-y-3">
          <div>
            <span class="text-sm text-surface-500">{{ $t('myAccount.username') }}:</span>
            <span class="ml-2 text-surface-800">{{ username || '-' }}</span>
          </div>
          <div>
            <span class="text-sm text-surface-500">{{ $t('myAccount.email') }}:</span>
            <span class="ml-2 text-surface-800">{{ user?.email || '-' }}</span>
          </div>
          <div>
            <span class="text-sm text-surface-500">{{ $t('myAccount.displayName') }}:</span>
            <span class="ml-2 text-surface-800">{{ user?.displayName || '-' }}</span>
          </div>
        </div>
      </div>

      <hr class="my-6 border-surface-200" />

      <div>
        <h2 class="text-lg font-semibold text-red-600">{{ $t('myAccount.dangerZone') }}</h2>
        <p class="mt-2 text-sm text-surface-500">{{ $t('myAccount.deleteWarning') }}</p>

        <AlertDialogRoot v-model:open="showDeleteDialog">
          <AlertDialogTrigger
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            <TrashIcon class="h-5 w-5" />
            {{ $t('myAccount.deleteAccount') }}
          </AlertDialogTrigger>

          <AlertDialogPortal>
            <AlertDialogOverlay class="fixed inset-0 z-50 bg-black/50" />
            <AlertDialogContent
              class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
            >
              <AlertDialogTitle class="text-lg font-semibold text-surface-800">
                {{ $t('myAccount.confirmDelete.title') }}
              </AlertDialogTitle>
              <AlertDialogDescription class="mt-2 text-sm text-surface-500">
                {{ $t('myAccount.confirmDelete.description') }}
              </AlertDialogDescription>

              <div v-if="error" class="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">
                {{ error }}
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <AlertDialogCancel
                  class="rounded-lg px-4 py-2 text-surface-600 transition-colors hover:bg-surface-100"
                >
                  {{ $t('myAccount.confirmDelete.cancel') }}
                </AlertDialogCancel>
                <AlertDialogAction
                  class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  :disabled="isDeleting"
                  @click.prevent="handleDeleteAccount"
                >
                  <VueSpinnerOval v-if="isDeleting" :size="16" color="white" />
                  {{ isDeleting ? $t('myAccount.confirmDelete.deleting') : $t('myAccount.confirmDelete.confirm') }}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialogRoot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from 'radix-vue'
import { VueSpinnerOval } from 'vue3-spinners'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const route = useRoute()
const { user, username, deleteAccount, error } = useAuth()
const { showToast } = useToast()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)

const handleDeleteAccount = async () => {
  isDeleting.value = true

  const success = await deleteAccount()

  if (success) {
    showDeleteDialog.value = false
    showToast({
      title: t('toast.accountDeleted.title'),
      description: t('toast.accountDeleted.description'),
      type: 'info'
    })
    router.push({ name: 'Home', params: { locale: route.params.locale } })
  }

  isDeleting.value = false
}
</script>
