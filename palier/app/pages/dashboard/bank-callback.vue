<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// Bridge Connect redirects here after the user finishes (or abandons) the
// hosted bank login. This page is purely UX — the actual "is it connected"
// signal comes from the item.created webhook (server/api/webhooks/bridge.post.ts),
// which may land a few seconds after this redirect, not necessarily before it.
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="eyebrow">Bank connection</p>
    <h1 class="display text-3xl">You're back</h1>
    <p class="text-sm text-(--color-fg-soft)">
      If you completed the bank login, this usually confirms within a few seconds
      once Bridge notifies us. Check
      <NuxtLink to="/dashboard/integrations" class="underline">Integrations</NuxtLink>
      — refresh if it still shows "Not connected" after a moment.
    </p>
    <NuxtLink to="/dashboard/integrations" class="mt-2 w-fit rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-white">
      Back to Integrations
    </NuxtLink>
  </div>
</template>
