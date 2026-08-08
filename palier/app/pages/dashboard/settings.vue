<script setup lang="ts">
/**
 * Réglages — écran neuf, conçu en maquette et absent du code.
 *
 * La maquette en propose sept sections. Quatre ne sont pas reprises, parce
 * qu'aucune n'a de support côté serveur et qu'un réglage qui ne règle rien est
 * pire qu'un réglage absent :
 *
 * - Seuil de rapprochement automatique (curseur). Le moteur n'a pas de seuil
 *   paramétrable : reconcile.ts rapproche sur des règles fixes.
 * - Règles d'association. Rien ne les stocke ni ne les applique.
 * - Notifications (rapport mensuel, alerte impayé, renouvellement DSP2).
 *   Aucun envoi programmé n'existe.
 * - Export complet / suppression de compte. Non implémentés. L'export CSV du
 *   Grand livre, lui, est réel et vit sur cet écran-là.
 *
 * Le champ « Nom » de la maquette n'existe pas non plus : le modèle User ne
 * porte qu'un email. Ce qui reste est réel, et tout y fonctionne.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { user } = useUserSession()
const { push } = useToasts()
const { data: org } = await useFetch('/api/org/me')

const sendingReset = ref(false)
async function requestPasswordReset() {
  if (!user.value?.email) return
  sendingReset.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: user.value.email } })
    push(t('set.toast.reset').replace('{email}', user.value.email), { tone: 'ok' })
  } finally {
    sendingReset.value = false
  }
}

const subscribing = ref(false)
async function subscribe() {
  subscribing.value = true
  try {
    const { url } = await $fetch('/api/billing/checkout', { method: 'POST' })
    window.location.href = url
  } finally {
    subscribing.value = false
  }
}

const planTone = computed(
  () =>
    ({ trial: 'signal', active: 'ok', canceled: 'danger' })[org.value?.plan ?? 'trial'] as 'signal' | 'ok' | 'danger',
)
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-5">
    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6">
      <h2 class="eyebrow text-[0.68rem]">{{ t('set.profile') }}</h2>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="eyebrow text-[0.6rem]">{{ t('auth.f.email') }}</dt>
          <dd class="mt-1.5 text-sm">{{ user?.email }}</dd>
        </div>
        <div>
          <dt class="eyebrow text-[0.6rem]">{{ t('set.entity') }}</dt>
          <dd class="mt-1.5 text-sm">{{ org?.name }}</dd>
        </div>
      </dl>
      <button
        type="button"
        :disabled="sendingReset"
        class="mt-5 rounded-md border border-(--color-line) px-4 py-2.5 text-[13.5px] font-semibold text-(--color-fg-soft) transition-colors hover:text-(--color-fg) disabled:opacity-50"
        @click="requestPasswordReset"
      >
        {{ sendingReset ? t('auth.forgot.pending') : t('set.changePw') }}
      </button>
      <p class="eyebrow mt-2.5 text-[0.6rem] leading-relaxed normal-case">{{ t('set.changePwNote') }}</p>
    </section>

    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6">
      <h2 class="eyebrow text-[0.68rem]">{{ t('set.appearance') }}</h2>
      <p class="mt-2 text-sm leading-relaxed text-(--color-fg-soft)">{{ t('set.appearanceNote') }}</p>
      <AppearanceControls class="mt-4 flex-wrap" />
    </section>

    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="eyebrow text-[0.68rem]">{{ t('dash.subscription') }}</h2>
        <StatusPill
          v-if="org?.plan"
          :tone="planTone"
          :label="t(`dash.plan.${org.plan}`)"
        />
      </div>

      <p class="mt-3 text-sm text-(--color-fg-soft)">
        {{ t('set.planNote') }}
        <span v-if="org?.stripe.subscriptionStatus"> ({{ org.stripe.subscriptionStatus }})</span>
      </p>

      <button
        v-if="org?.plan !== 'active'"
        type="button"
        :disabled="subscribing"
        class="mt-4 rounded-md bg-(--color-cobalt) px-5 py-3 text-sm font-bold text-(--color-on-cobalt) transition-opacity hover:opacity-90 disabled:opacity-50"
        @click="subscribe"
      >
        {{ subscribing ? t('dash.redirecting') : t('dash.subscribe') }}
      </button>
    </section>

    <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6">
      <h2 class="eyebrow text-[0.68rem]">{{ t('set.connections') }}</h2>
      <ul class="mt-4 flex flex-col">
        <li class="flex items-center justify-between gap-3 border-b border-(--color-line) py-3.5">
          <span class="text-sm font-semibold">{{ t('dash.rentila') }}</span>
          <StatusPill
            :tone="org?.rentila.connected ? 'ok' : 'neutral'"
            :label="org?.rentila.connected ? t('dash.connected') : t('dash.notConnected')"
          />
        </li>
        <li class="flex items-center justify-between gap-3 py-3.5">
          <span class="text-sm font-semibold">{{ t('dash.bankAccount') }}</span>
          <StatusPill
            :tone="org?.enablebanking.connected || org?.bridge.connected ? 'ok' : 'neutral'"
            :label="org?.enablebanking.connected || org?.bridge.connected ? t('dash.connected') : t('dash.notConnected')"
          />
        </li>
      </ul>
      <NuxtLink to="/dashboard/integrations" class="eyebrow mt-4 inline-block text-[0.62rem] text-(--color-cobalt)">
        {{ t('set.manageConnections') }}
      </NuxtLink>
    </section>

    <!-- Rentila reste la référence : le rappeler ici, là où on vient chercher
         « comment je change ça ? », évite la fausse attente d'un réglage. -->
    <p class="eyebrow text-[0.62rem] leading-relaxed normal-case">{{ t('set.readOnlyNote') }}</p>
  </div>
</template>
