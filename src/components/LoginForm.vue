<template>
  <FormKit
    type="form"
    :actions="false"
    form-class="space-y-6"
    @submit="handleSubmit"
  >
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

    <div v-if="error" class="rounded bg-red-50 p-3 text-red-600">
      {{ error }}
    </div>

    <FormKit
      type="submit"
      label="Login"
    />
  </FormKit>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const email = ref('')
const password = ref('')

const { loginWithEmail, error } = useAuth()
const { showToast } = useToast()
const router = useRouter()

const handleSubmit = async () => {
  const success = await loginWithEmail(email.value, password.value)
  if (success) {
    showToast({
      title: t('toast.loginSuccess.title'),
      description: t('toast.loginSuccess.description'),
      type: 'success'
    })
    router.push({ name: 'Home', params: { locale: route.params.locale } })
  }
}
</script>
