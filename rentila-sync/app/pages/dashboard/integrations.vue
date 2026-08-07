<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data: org, refresh } = await useFetch('/api/org/me')

// --- Rentila -----------------------------------------------------------
// Rentila has no browser-redirect OAuth for third-party apps (confirmed —
// see rentila-sync/README.md "Phase 0 findings"): the only documented
// mechanism is a landlord generating their own client_id/client_secret from
// their Rentila account page and handing them to the app that uses them.
// This form is that, not an OAuth redirect.
const rentilaClientId = ref('')
const rentilaClientSecret = ref('')
const rentilaConnecting = ref(false)
const rentilaError = ref('')

async function connectRentila() {
  rentilaError.value = ''
  rentilaConnecting.value = true
  try {
    await $fetch('/api/rentila/connect', {
      method: 'POST',
      body: { clientId: rentilaClientId.value, clientSecret: rentilaClientSecret.value },
    })
    rentilaClientId.value = ''
    rentilaClientSecret.value = ''
    await refresh()
  } catch (err: any) {
    rentilaError.value = err?.data?.statusMessage || 'Could not connect to Rentila'
  } finally {
    rentilaConnecting.value = false
  }
}

const syncing = ref(false)
async function syncRentila() {
  syncing.value = true
  try {
    await $fetch('/api/rentila/sync', { method: 'POST' })
  } finally {
    syncing.value = false
  }
}

// --- Bridge (bank connection, e.g. CEPAC) -------------------------------
// This one IS a real redirect flow — Bridge Connect's hosted webview
// handles the actual bank login, we never see the bank credentials.
const bridgeConnecting = ref(false)
async function connectBank() {
  bridgeConnecting.value = true
  try {
    const { url } = await $fetch('/api/bridge/connect', { method: 'POST' })
    window.location.href = url
  } finally {
    bridgeConnecting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">Integrations</p>
      <h1 class="display mt-1 text-3xl">Connect your accounts</h1>
    </div>

    <!-- Rentila -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <div class="flex items-center justify-between">
        <p class="eyebrow">Rentila</p>
        <span v-if="org?.rentila.connected" class="text-sm text-green-500">Connected</span>
      </div>

      <template v-if="org?.rentila.connected">
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          Landlord ID {{ org.rentila.landlordId }}. Properties/leases/payments sync
          automatically every 30 minutes, or pull now:
        </p>
        <button
          :disabled="syncing"
          class="mt-3 rounded border border-(--color-line) px-4 py-2 text-sm disabled:opacity-50"
          @click="syncRentila"
        >
          {{ syncing ? 'Syncing…' : 'Sync now' }}
        </button>
      </template>

      <template v-else>
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          Rentila doesn't offer a "Connect account" redirect for third-party apps —
          generate a client ID/secret from your own Rentila profile
          (My Account → API) and paste them here. Stored encrypted, never shown again.
        </p>
        <form class="mt-4 flex flex-col gap-3 sm:max-w-sm" @submit.prevent="connectRentila">
          <input
            v-model="rentilaClientId"
            type="text"
            required
            placeholder="Client ID"
            class="rounded border border-(--color-line) px-3 py-2 text-sm"
          >
          <input
            v-model="rentilaClientSecret"
            type="password"
            required
            placeholder="Client secret"
            class="rounded border border-(--color-line) px-3 py-2 text-sm"
          >
          <p v-if="rentilaError" class="text-sm text-red-500">{{ rentilaError }}</p>
          <button
            type="submit"
            :disabled="rentilaConnecting"
            class="rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {{ rentilaConnecting ? 'Connecting…' : 'Connect Rentila' }}
          </button>
        </form>
      </template>
    </section>

    <!-- Bridge / bank -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <div class="flex items-center justify-between">
        <p class="eyebrow">Bank account</p>
        <span v-if="org?.bridge.connected" class="text-sm text-green-500">Connected</span>
      </div>

      <template v-if="org?.bridge.connected">
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          Bank account linked. New transactions sync automatically.
        </p>
      </template>
      <template v-else>
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          Connect your bank (CEPAC — Caisse d'Épargne Provence Alpes Corse, or any
          other) via Bridge's secure hosted login. You'll be redirected to Bridge/your
          bank's own login page — never entered here.
        </p>
        <button
          :disabled="bridgeConnecting"
          class="mt-3 rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          @click="connectBank"
        >
          {{ bridgeConnecting ? 'Redirecting…' : 'Connect a bank account' }}
        </button>
      </template>
    </section>
  </div>
</template>
