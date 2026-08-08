<script setup lang="ts">
const { t } = useLocale()
const route = useRoute()
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
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await navigateTo(redirect)
  } catch {
    // Deliberately generic — the API already avoids saying which of
    // email/password was wrong, don't undo that here.
    error.value = t('auth.login.invalid')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-16">
    <h1 class="display text-2xl">{{ t('auth.login.title') }}</h1>

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
        :placeholder="t('auth.f.password')"
        autocomplete="current-password"
        class="rounded border border-(--color-line) px-3 py-2 text-sm"
      >

      <p v-if="error" class="text-sm text-(--color-danger-text)">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
      >
        {{ loading ? t('auth.login.pending') : t('auth.login.submit') }}
      </button>
    </form>

    <div class="flex justify-between text-sm text-(--color-fg-soft)">
      <NuxtLink to="/signup" class="underline">{{ t('auth.toSignup') }}</NuxtLink>
      <NuxtLink to="/forgot-password" class="underline">{{ t('auth.forgot') }}</NuxtLink>
    </div>
  </main>
</template>
