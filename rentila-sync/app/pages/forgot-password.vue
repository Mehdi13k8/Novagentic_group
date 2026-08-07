<script setup lang="ts">
const email = ref('')
const sent = ref(false)
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
  } finally {
    // Show the same "sent" state whether or not the account exists — the
    // API is deliberately silent on that too, don't leak it in the UI.
    loading.value = false
    sent.value = true
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="text-xl font-semibold">Reset your password</h1>

    <template v-if="sent">
      <p class="text-sm text-neutral-500">
        If an account exists for that email, a reset link has been sent.
      </p>
    </template>

    <form v-else class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        autocomplete="email"
        class="rounded border border-neutral-300 px-3 py-2 text-sm"
      >
      <button
        type="submit"
        :disabled="loading"
        class="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ loading ? 'Sending…' : 'Send reset link' }}
      </button>
    </form>

    <p class="text-sm text-neutral-500">
      <NuxtLink to="/login" class="underline">Back to log in</NuxtLink>
    </p>
  </main>
</template>
