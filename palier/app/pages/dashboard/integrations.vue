<script setup lang="ts">
const { t } = useLocale()
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data: org, refresh } = await useFetch('/api/org/me')

// --- Rentila -----------------------------------------------------------
// Rentila has no browser-redirect OAuth for third-party apps (confirmed —
// see palier/README.md "Phase 0 findings"): the only documented
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

// --- Enable Banking (bank connection, fast no-KYB alternative) ----------
// Temporary stand-in for Bridge while Bridge's production KYB is pending —
// see .env.example. "Restricted Production" only works for accounts you
// link yourself, so this is a stopgap for the landlord's own bank, not a
// general replacement for Bridge. Also a real redirect flow — same "we
// never see the bank credentials" property as Bridge.
const route = useRoute()
const ebAspsps = ref<{ name: string; country: string }[]>([])
const ebSelectedAspsp = ref('')
const ebConnecting = ref(false)
const ebError = ref(
  route.query.bank === 'error' ? "Couldn't finish connecting — try again, or pick a different bank." : '',
)
const ebSyncing = ref(false)

onMounted(async () => {
  if (org.value?.enablebanking.connected) return
  try {
    const { aspsps } = await $fetch('/api/enablebanking/aspsps', { query: { country: 'FR' } })
    ebAspsps.value = aspsps
  } catch {
    ebError.value = t('int.eb.listError')
  }
})

async function connectEnableBanking() {
  const aspsp = ebAspsps.value.find((a) => a.name === ebSelectedAspsp.value)
  if (!aspsp) return
  ebError.value = ''
  ebConnecting.value = true
  try {
    const { url } = await $fetch('/api/enablebanking/connect', {
      method: 'POST',
      body: { aspspName: aspsp.name, aspspCountry: aspsp.country },
    })
    window.location.href = url
  } catch (err: any) {
    ebError.value = err?.data?.statusMessage || 'Could not start the connection'
    ebConnecting.value = false
  }
}

async function syncEnableBanking() {
  ebError.value = ''
  ebSyncing.value = true
  try {
    await $fetch('/api/enablebanking/sync', { method: 'POST' })
  } catch (err: any) {
    // 429 = the bank itself is rate-limiting polling (PSD2-mandated caps,
    // not a bug) — server/utils/reconcile.ts already turns that into a
    // clean statusMessage instead of a raw crash; just surface it.
    ebError.value = err?.data?.statusMessage || 'Could not sync — try again in a moment.'
  } finally {
    ebSyncing.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">{{ t('nav.integrations') }}</p>
      <h1 class="display mt-1 text-3xl">{{ t('int.title') }}</h1>
    </div>

    <!-- Rentila -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <div class="flex items-center justify-between">
        <p class="eyebrow">{{ t('dash.rentila') }}</p>
        <span v-if="org?.rentila.connected" class="text-sm text-(--color-ok-text)">{{ t('dash.connected') }}</span>
      </div>

      <template v-if="org?.rentila.connected">
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.r.linked').replace('{id}', String(org.rentila.landlordId)) }}
        </p>
        <button
          :disabled="syncing"
          class="mt-3 rounded border border-(--color-line) px-4 py-2 text-sm disabled:opacity-50"
          @click="syncRentila"
        >
          {{ syncing ? t('int.syncing') : t('int.syncNow') }}
        </button>
      </template>

      <template v-else>
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.r.noRedirect') }}
        </p>
        <div class="mt-3 rounded border border-(--color-signal-text)/40 bg-(--color-signal-text)/10 p-3 text-sm">
          <p class="text-(--color-fg)">
            <strong>{{ t('int.r.warnTitle') }}</strong> {{ t('int.r.warnBody') }}
          </p>
          <a
            href="https://www.rentila.com/landlord/#profile/apiclient"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-1 inline-block text-(--color-cobalt) underline"
          >
            {{ t('int.r.generate') }}
          </a>
        </div>
        <!--
          autocomplete="off" on the fields (and unique, non-"password"-like
          names) is deliberate: a bare text+password input pair in a <form>
          is exactly the shape browsers pattern-match as a login form, so
          without this a password manager can offer to autofill/save the
          user's actual Rentila account credentials here — reinforcing the
          "this is a login" mistake we're trying to prevent above.
        -->
        <form
          class="mt-4 flex flex-col gap-3 sm:max-w-sm"
          autocomplete="off"
          @submit.prevent="connectRentila"
        >
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-(--color-fg-soft)">{{ t('int.r.clientId') }}</span>
            <input
              v-model="rentilaClientId"
              name="rentila-client-id"
              type="text"
              required
              autocomplete="off"
              :placeholder="t('int.r.phId')"
              class="rounded border border-(--color-line) px-3 py-2 text-sm"
            >
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-(--color-fg-soft)">{{ t('int.r.clientSecret') }}</span>
            <input
              v-model="rentilaClientSecret"
              name="rentila-client-secret"
              type="password"
              required
              autocomplete="off"
              :placeholder="t('int.r.phSecret')"
              class="rounded border border-(--color-line) px-3 py-2 text-sm"
            >
          </label>
          <p class="text-xs text-(--color-fg-soft)">{{ t('int.r.stored') }}</p>
          <p v-if="rentilaError" class="text-sm text-(--color-danger-text)">
            {{ rentilaError }}
            <template v-if="rentilaError.includes('client ID/secret')">
              {{ t('int.r.hint') }}
            </template>
          </p>
          <button
            type="submit"
            :disabled="rentilaConnecting"
            class="rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
          >
            {{ rentilaConnecting ? t('int.connecting') : t('int.r.connect') }}
          </button>
        </form>
      </template>
    </section>

    <!-- Bridge / bank -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <div class="flex items-center justify-between">
        <p class="eyebrow">{{ t('dash.bankAccount') }}</p>
        <span v-if="org?.bridge.connected" class="text-sm text-(--color-ok-text)">{{ t('dash.connected') }}</span>
      </div>

      <template v-if="org?.bridge.connected">
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.b.linked') }}
        </p>
      </template>
      <template v-else>
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.b.body') }}
        </p>
        <button
          :disabled="bridgeConnecting"
          class="mt-3 rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
          @click="connectBank"
        >
          {{ bridgeConnecting ? t('int.redirecting') : t('int.b.connect') }}
        </button>
      </template>
    </section>

    <!-- Enable Banking / bank (fast, no-KYB stopgap) -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <div class="flex items-center justify-between">
        <p class="eyebrow">{{ t('int.eb.label') }}</p>
        <span v-if="org?.enablebanking.connected" class="text-sm text-(--color-ok-text)">{{ t('dash.connected') }}</span>
      </div>

      <template v-if="org?.enablebanking.connected">
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.eb.linked').replace('{bank}', org.enablebanking.aspspName ?? '') }}
        </p>
        <button
          :disabled="ebSyncing"
          class="mt-3 rounded border border-(--color-line) px-4 py-2 text-sm disabled:opacity-50"
          @click="syncEnableBanking"
        >
          {{ ebSyncing ? t('int.syncing') : t('int.syncNow') }}
        </button>
        <p v-if="ebError" class="mt-2 text-sm text-(--color-danger-text)">{{ ebError }}</p>
      </template>
      <template v-else>
        <p class="mt-2 text-sm text-(--color-fg-soft)">
          {{ t('int.eb.body') }}
        </p>
        <div class="mt-3 rounded border border-(--color-signal-text)/40 bg-(--color-signal-text)/10 p-3 text-sm text-(--color-fg)">
          {{ t('int.eb.restricted') }}
        </div>
        <form class="mt-4 flex flex-col gap-3 sm:max-w-sm" @submit.prevent="connectEnableBanking">
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-(--color-fg-soft)">{{ t('int.eb.bank') }}</span>
            <select
              v-model="ebSelectedAspsp"
              required
              class="rounded border border-(--color-line) bg-(--color-bg-raised) px-3 py-2 text-sm"
            >
              <option value="" disabled>{{ ebAspsps.length ? t('int.eb.choose') : t('int.eb.loading') }}</option>
              <option v-for="a in ebAspsps" :key="a.name" :value="a.name">{{ a.name }}</option>
            </select>
          </label>
          <p v-if="ebError" class="text-sm text-(--color-danger-text)">{{ ebError }}</p>
          <button
            type="submit"
            :disabled="ebConnecting || !ebSelectedAspsp"
            class="rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
          >
            {{ ebConnecting ? t('int.redirecting') : t('int.b.connect') }}
          </button>
        </form>
      </template>
    </section>
  </div>
</template>
