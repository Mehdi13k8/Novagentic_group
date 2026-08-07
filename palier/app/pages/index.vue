<script setup lang="ts">
// Public landing/status page. The real product lives behind auth at
// /dashboard/* now — this is what a logged-out visitor sees, plus enough
// health info to debug local setup at a glance.
const { data: health } = await useFetch('/api/health')
const { user } = useUserSession()
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
    <div>
      <h1 class="display text-3xl">Palier</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        Reconciles bank transactions against Rentila rent payments, so you don't have
        to check by hand whether a tenant's transfer landed.
      </p>
    </div>

    <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-4 text-sm">
      <p class="eyebrow mb-2">Status</p>
      <p>
        API:
        <span :class="health?.ok ? 'text-green-500' : 'text-red-500'">
          {{ health?.ok ? 'up' : 'down' }}
        </span>
      </p>
      <p>
        MongoDB:
        <span :class="health?.mongo === 'connected' ? 'text-green-500' : 'text-(--color-signal)'">
          {{ health?.mongo ?? 'unknown' }}
        </span>
      </p>
      <p>
        Bridge:
        <span :class="health?.bridge === 'configured' ? 'text-green-500' : 'text-(--color-signal)'">
          {{ health?.bridge ?? 'unknown' }}
        </span>
      </p>
      <p>
        Stripe:
        <span :class="health?.stripe === 'configured' ? 'text-green-500' : 'text-(--color-signal)'">
          {{ health?.stripe ?? 'unknown' }}
        </span>
      </p>
    </div>

    <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-4 text-sm">
      <template v-if="user">
        <p>Logged in as <span class="font-medium">{{ user.email }}</span></p>
        <NuxtLink to="/dashboard" class="mt-3 inline-block rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-white">
          Go to dashboard
        </NuxtLink>
      </template>
      <template v-else>
        <p class="mb-2 text-(--color-fg-soft)">Not logged in.</p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="underline">Log in</NuxtLink>
          <NuxtLink to="/signup" class="underline">Sign up</NuxtLink>
        </div>
      </template>
    </div>
  </main>
</template>
