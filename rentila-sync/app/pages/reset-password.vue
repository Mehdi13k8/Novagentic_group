<script setup lang="ts">
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
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: email.value, token: token.value, password: password.value },
    })
    await navigateTo('/')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Invalid or expired reset link'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="text-xl font-semibold">Choose a new password</h1>

    <p v-if="!token" class="text-sm text-red-600">
      Missing reset token — use the link from the email (or dev server log).
    </p>

    <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        autocomplete="email"
        class="rounded border border-neutral-300 px-3 py-2 text-sm"
      >
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        placeholder="New password (8+ characters)"
        autocomplete="new-password"
        class="rounded border border-neutral-300 px-3 py-2 text-sm"
      >
      <input
        v-model="confirmPassword"
        type="password"
        required
        placeholder="Confirm new password"
        autocomplete="new-password"
        class="rounded border border-neutral-300 px-3 py-2 text-sm"
      >

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading || !token"
        class="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ loading ? 'Saving…' : 'Set new password' }}
      </button>
    </form>
  </main>
</template>
