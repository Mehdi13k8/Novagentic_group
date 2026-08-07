<script setup lang="ts">
// No real dashboard yet (see plan's step 6: connect Rentila, connect bank,
// matched/unmatched list) — this is a status page plus the auth entry
// points, enough to actually test signup/login/reset locally.
const { data: health } = await useFetch('/api/health')
const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshMe()
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
    <div>
      <h1 class="text-2xl font-semibold">Rentila Sync</h1>
      <p class="mt-2 text-sm text-neutral-500">
        Reconciles bank transactions against Rentila rent payments. Work in progress —
        no real dashboard yet, this page is a scaffold status check.
      </p>
    </div>

    <div class="rounded-lg border border-neutral-200 p-4 text-sm">
      <p>
        API:
        <span :class="health?.ok ? 'text-green-600' : 'text-red-600'">
          {{ health?.ok ? 'up' : 'down' }}
        </span>
      </p>
      <p>
        MongoDB:
        <span :class="health?.mongo === 'connected' ? 'text-green-600' : 'text-amber-600'">
          {{ health?.mongo ?? 'unknown' }}
        </span>
      </p>
    </div>

    <div class="rounded-lg border border-neutral-200 p-4 text-sm">
      <template v-if="me?.user">
        <p>Logged in as <span class="font-medium">{{ me.user.email }}</span></p>
        <button class="mt-2 underline" @click="logout">Log out</button>
      </template>
      <template v-else>
        <p class="mb-2">Not logged in.</p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="underline">Log in</NuxtLink>
          <NuxtLink to="/signup" class="underline">Sign up</NuxtLink>
        </div>
      </template>
    </div>
  </main>
</template>
