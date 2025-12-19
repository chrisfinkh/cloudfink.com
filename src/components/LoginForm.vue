<template>
  <FormKit
    type="form"
    :actions="false"
    form-class="space-y-6"
    @submit="handleSubmit"
  >
    <FormKit
      v-model="name"
      type="text"
      name="name"
      label="Display Name"
      placeholder="Your name"
      validation="required"
      validation-visibility="blur"
    />

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
      placeholder="Your password"
      validation="required|length:6"
      validation-visibility="blur"
    />

    <FormKit
      type="submit"
      label="Login"
    />
  </FormKit>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')

const { loginWithEmail } = useAuth()
const router = useRouter()

const handleSubmit = async () => {
  await loginWithEmail(email.value, password.value)
  router.push({ name: 'Home' })
}
</script>
