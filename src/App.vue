<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastViewport } from 'radix-vue'
import { useToast } from './composables/useToast'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const { isOpen, currentToast } = useToast()
</script>

<template>
  <ToastProvider>
    <div class="min-h-screen bg-surface-50 font-sans">
      <NavBar />
      <main class="container py-8">
        <RouterView />
      </main>
    </div>

    <ToastRoot
      v-model:open="isOpen"
      class="flex items-center gap-3 rounded-lg bg-white p-4 shadow-card data-[state=open]:animate-toastSlideIn data-[state=closed]:animate-toastHide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-toastSwipeOut"
    >
      <CheckCircleIcon
        v-if="currentToast?.type === 'success'"
        class="h-6 w-6 flex-shrink-0 text-green-500"
      />
      <ExclamationCircleIcon
        v-else-if="currentToast?.type === 'error'"
        class="h-6 w-6 flex-shrink-0 text-red-500"
      />
      <InformationCircleIcon
        v-else
        class="h-6 w-6 flex-shrink-0 text-primary"
      />
      <div>
        <ToastTitle class="font-medium text-surface-800">
          {{ currentToast?.title }}
        </ToastTitle>
        <ToastDescription
          v-if="currentToast?.description"
          class="mt-1 text-sm text-surface-300"
        >
          {{ currentToast.description }}
        </ToastDescription>
      </div>
    </ToastRoot>

    <ToastViewport class="fixed bottom-0 right-0 z-50 m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2 p-6 outline-none [--viewport-padding:_24px]" />
  </ToastProvider>
</template>
