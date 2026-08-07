<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo('/')
  } catch {
    // Deliberately generic — the API already avoids saying which of
    // email/password was wrong, don't undo that here.
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="text-xl font-semibold">Log in</h1>

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
        placeholder="Password"
        autocomplete="current-password"
        class="rounded border border-neutral-300 px-3 py-2 text-sm"
      >

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <div class="flex justify-between text-sm text-neutral-500">
      <NuxtLink to="/signup" class="underline">Create an account</NuxtLink>
      <NuxtLink to="/forgot-password" class="underline">Forgot password?</NuxtLink>
    </div>
  </main>
</template>
