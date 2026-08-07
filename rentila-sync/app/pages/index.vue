<script setup lang="ts">
// No auth/org UI yet — see server/models/User.ts. This page is a status
// check for the scaffold, not the real dashboard from the plan's step 6
// (org signup, connect Rentila creds, connect bank, matched/unmatched
// list). Build that next once auth exists.
const { data: health } = await useFetch('/api/health')
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
    <div>
      <h1 class="text-2xl font-semibold">Rentila Sync</h1>
      <p class="mt-2 text-sm text-neutral-500">
        Reconciles bank transactions against Rentila rent payments. Work in progress —
        no dashboard or auth yet, this page is a scaffold status check.
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
  </main>
</template>
