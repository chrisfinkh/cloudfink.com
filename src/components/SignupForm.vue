<template>
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

    <FormKit
      v-model="email"
      type="email"
      name="email"
      label="Email"
      placeholder="you@example.com"
      validation="required|email"
      validation-visibility="blur"
    />

    <FormKit
      v-model="password"
      type="password"
      name="password"
      label="Password"
      placeholder="Choose a password"
      validation="required|length:6"
      validation-visibility="blur"
    />

    <div v-if="error" class="rounded bg-red-50 p-3 text-red-600">
      {{ error }}
    </div>

    <FormKit
      type="submit"
      label="Signup"
      :disabled="nameStatus !== 'available'"
    />
  </FormKit>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDisplayNameCheck } from '@/composables/useDisplayNameCheck'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const { displayName, status: nameStatus, check: checkAvailability, isValid } = useDisplayNameCheck()
const email = ref('')
const password = ref('')

const { signUpWithEmail, claimUsername, error } = useAuth()
const { showToast } = useToast()
const router = useRouter()

const handleSubmit = async () => {
  if (!isValid()) return

  const success = await signUpWithEmail(email.value, password.value, displayName.value)
  if (!success) return

  const claimed = await claimUsername(displayName.value)
  if (claimed) {
    showToast({
      title: 'Welcome!',
      description: 'Your account has been created successfully.',
      type: 'success'
    })
    router.push({ name: 'Home' })
  }
}
</script>
