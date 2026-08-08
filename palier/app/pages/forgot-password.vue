<script setup lang="ts">
const { t } = useLocale()
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
    <h1 class="display text-2xl">{{ t('auth.forgot.title') }}</h1>

    <template v-if="sent">
      <p class="text-sm text-(--color-fg-soft)">
        {{ t('auth.forgot.sent') }}
      </p>
    </template>

    <form v-else class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        required
        :placeholder="t('auth.f.email')"
        autocomplete="email"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >
      <button
        type="submit"
        :disabled="loading"
        class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
      >
        {{ loading ? t('auth.forgot.pending') : t('auth.forgot.submit') }}
      </button>
    </form>

    <p class="text-sm text-(--color-fg-soft)">
      <NuxtLink to="/login" class="underline">{{ t('auth.forgot.back') }}</NuxtLink>
    </p>
  </main>
</template>
