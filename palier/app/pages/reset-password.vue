<script setup lang="ts">
const { t } = useLocale()
const route = useRoute()
const email = ref(String(route.query.email ?? ''))
const token = ref(String(route.query.token ?? ''))
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.signup.mismatch')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: email.value, token: token.value, password: password.value },
    })
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || t('auth.reset.invalid')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="display text-2xl">{{ t('auth.reset.title') }}</h1>

    <p v-if="!token" class="text-sm text-(--color-danger-text)">
      {{ t('auth.reset.noToken') }}
    </p>

    <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        required
        :placeholder="t('auth.f.email')"
        autocomplete="email"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        :placeholder="t('auth.f.newPassword')"
        autocomplete="new-password"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >
      <input
        v-model="confirmPassword"
        type="password"
        required
        :placeholder="t('auth.f.confirmNew')"
        autocomplete="new-password"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >

      <p v-if="error" class="text-sm text-(--color-danger-text)">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading || !token"
        class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
      >
        {{ loading ? t('auth.reset.pending') : t('auth.reset.submit') }}
      </button>
    </form>
  </main>
</template>
