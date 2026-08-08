<script setup lang="ts">
/**
 * Banque — les comptes reliés, et de quoi en relier un.
 *
 * L'écran empilait trois sections dont DEUX agrégateurs bancaires concurrents
 * (Bridge et Enable Banking) présentés côte à côte au bailleur. Lequel
 * choisir ? La question n'est pas la sienne : c'est un détail
 * d'implémentation. Il n'y a donc plus qu'un seul geste, « connecter un
 * compte », et le nom de l'agrégateur n'apparaît que là où il est
 * juridiquement utile — le consentement DSP2 est donné à un prestataire
 * nommé, le cacher serait malhonnête.
 *
 * Bridge n'est plus proposé à la connexion (sa validation KYB est en cours,
 * voir .env.example) mais reste affiché s'il est déjà relié : on ne fait pas
 * disparaître un compte existant d'un écran.
 *
 * Pas de « journal de synchronisation » comme dans la maquette : aucun
 * historique de synchro n'est stocké. La carte porte la dernière
 * synchronisation réelle, ce qui est vrai et suffit.
 */
const { t } = useLocale()
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data: org, refresh } = await useFetch('/api/org/me')
const { relative, fullDate } = useFormat()
const { push } = useToasts()
const route = useRoute()

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
    push(t('banque.toast.rentila'), { tone: 'ok' })
  } catch (err: unknown) {
    rentilaError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || t('banque.rentilaFailed')
  } finally {
    rentilaConnecting.value = false
  }
}

const syncing = ref(false)
async function syncRentila() {
  syncing.value = true
  try {
    await $fetch('/api/rentila/sync', { method: 'POST' })
    push(t('banque.toast.rentilaSync'), { tone: 'ok' })
  } finally {
    syncing.value = false
  }
}

// --- Connexion bancaire (Enable Banking) --------------------------------
// Vrai flux de redirection : la page de connexion est celle de la banque,
// Palier ne voit jamais les identifiants.
const ebAspsps = ref<{ name: string; country: string }[]>([])
const ebSelectedAspsp = ref('')
const ebConnecting = ref(false)
const ebError = ref(route.query.bank === 'error' ? t('banque.callbackError') : '')
const ebSyncing = ref(false)
const pickerOpen = ref(false)

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
  } catch (err: unknown) {
    ebError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || t('banque.connectFailed')
    ebConnecting.value = false
  }
}

async function syncEnableBanking() {
  ebError.value = ''
  ebSyncing.value = true
  try {
    await $fetch('/api/enablebanking/sync', { method: 'POST' })
    await refresh()
    push(t('banque.toast.synced'), { tone: 'ok' })
  } catch (err: unknown) {
    // 429 = the bank itself is rate-limiting polling (PSD2-mandated caps,
    // not a bug) — server/utils/reconcile.ts already turns that into a
    // clean statusMessage instead of a raw crash; just surface it.
    ebError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || t('banque.syncFailed')
  } finally {
    ebSyncing.value = false
  }
}

const hasBank = computed(() => Boolean(org.value?.enablebanking.connected || org.value?.bridge.connected))

const howSteps = computed(() => [t('banque.how.s1'), t('banque.how.s2'), t('banque.how.s3')])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Aucun compte : l'écran explique le flux au lieu d'afficher une grille vide. -->
    <div v-if="!hasBank" class="grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
      <section class="flex flex-col gap-3.5 rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-7">
        <p class="eyebrow text-[0.65rem]">{{ t('banque.emptyTitle') }}</p>
        <p class="text-sm leading-relaxed text-(--color-fg-soft)">{{ t('banque.connectDesc') }}</p>

        <form class="mt-1 flex flex-col gap-3" @submit.prevent="connectEnableBanking">
          <label class="flex flex-col gap-1.5 text-sm">
            <span class="eyebrow text-[0.6rem]">{{ t('int.eb.bank') }}</span>
            <select
              v-model="ebSelectedAspsp"
              required
              class="rounded-md border border-(--color-line) px-3 py-2.5 text-sm"
            >
              <option value="" disabled>{{ ebAspsps.length ? t('int.eb.choose') : t('int.eb.loading') }}</option>
              <option v-for="a in ebAspsps" :key="a.name" :value="a.name">{{ a.name }}</option>
            </select>
          </label>
          <p v-if="ebError" class="text-sm text-(--color-danger-text)">{{ ebError }}</p>
          <button
            type="submit"
            :disabled="ebConnecting || !ebSelectedAspsp"
            class="self-start rounded-md bg-(--color-cobalt) px-5 py-3 text-sm font-bold text-(--color-on-cobalt) transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {{ ebConnecting ? t('int.redirecting') : t('banque.connectCta') }}
          </button>
        </form>

        <p class="eyebrow mt-auto text-[0.6rem] leading-relaxed normal-case">{{ t('banque.noCreds') }}</p>
      </section>

      <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-7">
        <p class="eyebrow text-[0.65rem]">{{ t('banque.how') }}</p>
        <!-- Trois étapes qui se suivent réellement : la numérotation dit
             quelque chose de vrai ici. -->
        <ol class="mt-4 flex flex-col gap-4">
          <li v-for="(step, i) in howSteps" :key="step" class="flex items-start gap-3.5">
            <span
              class="eyebrow flex size-6.5 shrink-0 items-center justify-center rounded-full border border-(--color-line) text-[0.62rem] text-(--color-signal-text)"
            >
              {{ i + 1 }}
            </span>
            <p class="text-[13.5px] leading-relaxed">{{ step }}</p>
          </li>
        </ol>
      </section>
    </div>

    <!-- Comptes reliés -->
    <div v-else class="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-if="org?.enablebanking.connected"
        class="flex flex-col gap-3.5 rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="display text-[17px]">{{ org.enablebanking.aspspName }}</p>
          <StatusPill tone="ok" :label="t('dash.connected')" />
        </div>

        <div>
          <p class="eyebrow text-[0.6rem]">{{ t('banque.accounts') }}</p>
          <p class="mt-1 font-mono text-[1.35rem]">{{ org.enablebanking.accountCount }}</p>
        </div>

        <p class="eyebrow text-[0.62rem] normal-case">
          {{ t('banque.lastSync') }}
          {{ org.enablebanking.lastPolledAt ? relative(org.enablebanking.lastPolledAt) : t('sync.never') }}
        </p>
        <p v-if="org.enablebanking.validUntil" class="eyebrow text-[0.62rem] normal-case">
          {{ t('banque.consentUntil') }} {{ fullDate(org.enablebanking.validUntil) }}
        </p>

        <button
          type="button"
          :disabled="ebSyncing"
          class="eyebrow mt-auto self-start rounded-md border border-(--color-line) px-4 py-2 text-[0.62rem] transition-colors hover:border-(--color-cobalt) disabled:opacity-50"
          @click="syncEnableBanking"
        >
          {{ ebSyncing ? t('int.syncing') : t('int.syncNow') }}
        </button>
        <p v-if="ebError" class="text-sm text-(--color-danger-text)">{{ ebError }}</p>
      </article>

      <article
        v-if="org?.bridge.connected"
        class="flex flex-col gap-3.5 rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="display text-[17px]">{{ t('banque.otherAccount') }}</p>
          <StatusPill tone="ok" :label="t('dash.connected')" />
        </div>
        <p class="text-sm leading-relaxed text-(--color-fg-soft)">{{ t('int.b.linked') }}</p>
      </article>

      <button
        v-if="!org?.enablebanking.connected"
        type="button"
        class="flex flex-col items-start justify-center gap-2.5 rounded-lg border border-dashed border-(--color-line-strong) p-6 text-left transition-colors hover:border-(--color-cobalt)"
        @click="pickerOpen = !pickerOpen"
      >
        <span class="font-mono text-lg text-(--color-cobalt)">+</span>
        <span class="display text-base">{{ t('banque.connectCta') }}</span>
        <span class="eyebrow text-[0.62rem] leading-relaxed normal-case">{{ t('banque.connectDesc') }}</span>
      </button>
    </div>

    <!-- Sélecteur de banque, déplié depuis la tuile « + » -->
    <section
      v-if="hasBank && pickerOpen && !org?.enablebanking.connected"
      class="max-w-md rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6"
    >
      <form class="flex flex-col gap-3" @submit.prevent="connectEnableBanking">
        <label class="flex flex-col gap-1.5 text-sm">
          <span class="eyebrow text-[0.6rem]">{{ t('int.eb.bank') }}</span>
          <select v-model="ebSelectedAspsp" required class="rounded-md border border-(--color-line) px-3 py-2.5 text-sm">
            <option value="" disabled>{{ ebAspsps.length ? t('int.eb.choose') : t('int.eb.loading') }}</option>
            <option v-for="a in ebAspsps" :key="a.name" :value="a.name">{{ a.name }}</option>
          </select>
        </label>
        <p v-if="ebError" class="text-sm text-(--color-danger-text)">{{ ebError }}</p>
        <button
          type="submit"
          :disabled="ebConnecting || !ebSelectedAspsp"
          class="self-start rounded-md bg-(--color-cobalt) px-5 py-3 text-sm font-bold text-(--color-on-cobalt) disabled:opacity-50"
        >
          {{ ebConnecting ? t('int.redirecting') : t('banque.connectCta') }}
        </button>
      </form>
    </section>

    <!-- Rentila : la source des loyers attendus, pas une banque. -->
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="eyebrow text-[0.68rem]">{{ t('dash.rentila') }}</h2>
        <StatusPill v-if="org?.rentila.connected" tone="ok" :label="t('dash.connected')" />
      </div>

      <template v-if="org?.rentila.connected">
        <p class="mt-3 text-sm leading-relaxed text-(--color-fg-soft)">
          {{ t('int.r.linked').replace('{id}', String(org.rentila.landlordId)) }}
        </p>
        <button
          type="button"
          :disabled="syncing"
          class="eyebrow mt-4 rounded-md border border-(--color-line) px-4 py-2 text-[0.62rem] transition-colors hover:border-(--color-cobalt) disabled:opacity-50"
          @click="syncRentila"
        >
          {{ syncing ? t('int.syncing') : t('int.syncNow') }}
        </button>
      </template>

      <template v-else>
        <p class="mt-3 text-sm leading-relaxed text-(--color-fg-soft)">{{ t('int.r.noRedirect') }}</p>
        <div class="mt-4 rounded-md border border-(--color-signal-text)/40 bg-(--color-signal-text)/10 p-3.5 text-sm">
          <p><strong>{{ t('int.r.warnTitle') }}</strong> {{ t('int.r.warnBody') }}</p>
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
        <form class="mt-4 flex max-w-sm flex-col gap-3" autocomplete="off" @submit.prevent="connectRentila">
          <label class="flex flex-col gap-1.5 text-sm">
            <span class="eyebrow text-[0.6rem]">{{ t('int.r.clientId') }}</span>
            <input
              v-model="rentilaClientId"
              name="rentila-client-id"
              type="text"
              required
              autocomplete="off"
              :placeholder="t('int.r.phId')"
              class="rounded-md border border-(--color-line) px-3 py-2.5 text-sm"
            >
          </label>
          <label class="flex flex-col gap-1.5 text-sm">
            <span class="eyebrow text-[0.6rem]">{{ t('int.r.clientSecret') }}</span>
            <input
              v-model="rentilaClientSecret"
              name="rentila-client-secret"
              type="password"
              required
              autocomplete="off"
              :placeholder="t('int.r.phSecret')"
              class="rounded-md border border-(--color-line) px-3 py-2.5 text-sm"
            >
          </label>
          <p class="eyebrow text-[0.6rem] normal-case">{{ t('int.r.stored') }}</p>
          <p v-if="rentilaError" class="text-sm text-(--color-danger-text)">
            {{ rentilaError }}
            <template v-if="rentilaError.includes('client ID/secret')">{{ t('int.r.hint') }}</template>
          </p>
          <button
            type="submit"
            :disabled="rentilaConnecting"
            class="self-start rounded-md bg-(--color-cobalt) px-5 py-3 text-sm font-bold text-(--color-on-cobalt) disabled:opacity-50"
          >
            {{ rentilaConnecting ? t('int.connecting') : t('int.r.connect') }}
          </button>
        </form>
      </template>
    </section>
  </div>
</template>
