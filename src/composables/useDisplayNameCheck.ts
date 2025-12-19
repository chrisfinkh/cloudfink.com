import { ref } from 'vue'
import { useAuth } from './useAuth'

export const useDisplayNameCheck = () => {
  const displayName = ref('')
  const status = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const { isUsernameAvailable } = useAuth()

  const check = async () => {
    if (displayName.value.length < 2) {
      status.value = 'idle'
      return
    }

    status.value = 'checking'
    const available = await isUsernameAvailable(displayName.value)
    status.value = available ? 'available' : 'taken'
  }

  const isValid = () => status.value === 'available'

  return {
    displayName,
    status,
    check,
    isValid
  }
}
