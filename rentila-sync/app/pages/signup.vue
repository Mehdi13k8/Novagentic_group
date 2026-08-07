<script setup lang="ts">
const email = ref('')
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
    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not create account'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="display text-2xl">Create an account</h1>

    <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        autocomplete="email"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        placeholder="Password (8+ characters)"
        autocomplete="new-password"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >
      <input
        v-model="confirmPassword"
        type="password"
        required
        placeholder="Confirm password"
        autocomplete="new-password"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ loading ? 'Creating…' : 'Create account' }}
      </button>
    </form>

    <p class="text-sm text-(--color-fg-soft)">
      Already have an account? <NuxtLink to="/login" class="underline">Log in</NuxtLink>
    </p>
  </main>
</template>
