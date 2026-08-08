<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// Bridge Connect redirects here after the user finishes (or abandons) the
// hosted bank login. This page is purely UX — the actual "is it connected"
// signal comes from the item.created webhook (server/api/webhooks/bridge.post.ts),
// which may land a few seconds after this redirect, not necessarily before it.
const { t } = useLocale()
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="eyebrow">{{ t('dash.bankConnection') }}</p>
    <h1 class="display text-3xl">{{ t('dash.backTitle') }}</h1>
    <p class="text-sm text-(--color-fg-soft)">
      {{ t('cb.lede') }}
      <NuxtLink to="/dashboard/integrations" class="underline">{{ t('nav.integrations') }}</NuxtLink>
      {{ t('cb.lede2') }}
    </p>
    <NuxtLink to="/dashboard/integrations" class="mt-2 w-fit rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-(--color-on-cobalt)">
      {{ t('cb.back') }}
    </NuxtLink>
  </div>
</template>
