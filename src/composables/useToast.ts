import { ref } from 'vue'

export interface Toast {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

const isOpen = ref(false)
const currentToast = ref<Toast | null>(null)

export const useToast = () => {
  const showToast = (toast: Toast) => {
    currentToast.value = toast
    isOpen.value = true
  }

  const hideToast = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    currentToast,
    showToast,
    hideToast
  }
}
