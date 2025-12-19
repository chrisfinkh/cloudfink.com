<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h2 class="mb-2 text-2xl font-bold text-surface-800">Choose your display name</h2>
        <p class="mb-6 text-surface-300">
          Pick a unique name to complete your account setup.
        </p>

        <FormKit
          type="form"
          :actions="false"
          form-class="space-y-6"
          @submit="handleSubmit"
        >
          <div>
            <FormKit
              v-model="displayName"
              type="text"
              name="displayName"
              label="Display Name"
              placeholder="Your name"
              validation="required|length:2,50"
              validation-visibility="blur"
              @blur="checkAvailability"
            />
            <p v-if="nameStatus === 'checking'" class="mt-1 text-sm text-surface-300">
              Checking availability...
            </p>
            <p v-else-if="nameStatus === 'available'" class="mt-1 text-sm text-green-600">
              Name is available
            </p>
            <p v-else-if="nameStatus === 'taken'" class="mt-1 text-sm text-red-600">
              Name is already taken
            </p>
          </div>

          <div v-if="error" class="rounded bg-red-50 p-3 text-red-600">
            {{ error }}
          </div>

          <FormKit
            type="submit"
            label="Continue"
            :disabled="nameStatus !== 'available' || isSubmitting"
          />
        </FormKit>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDisplayNameCheck } from '@/composables/useDisplayNameCheck'

const emit = defineEmits<{
  complete: []
}>()

const { displayName, status: nameStatus, check: checkAvailability, isValid } = useDisplayNameCheck()
const isSubmitting = ref(false)

const { claimUsername, error } = useAuth()

const handleSubmit = async () => {
  if (!isValid()) return

  isSubmitting.value = true
  const claimed = await claimUsername(displayName.value)
  isSubmitting.value = false

  if (claimed) {
    emit('complete')
  }
}
</script>
