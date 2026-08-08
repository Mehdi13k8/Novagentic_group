<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { data: org, refresh } = await useFetch('/api/org/me')
const { data: transactions } = await useFetch('/api/transactions')
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

onActivated(() => refresh())
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">{{ t('nav.dashboard') }}</p>
      <h1 class="display mt-1 text-3xl">{{ org?.name }}</h1>
    </div>

    <NuxtLink
      v-if="transactions?.newMatchesCount"
      to="/dashboard/virements"
      class="rounded-lg border border-(--color-ok-text)/40 bg-(--color-ok-text)/10 p-5 text-sm transition-colors hover:border-(--color-ok-text)"
    >
      <p class="font-medium text-(--color-fg)">
        🔔 {{ transactions.newMatchesCount }} {{ transactions.newMatchesCount > 1 ? t('dash.newMatches') : t('dash.newMatch') }}
      </p>
      <p class="mt-1 text-(--color-fg-soft)">{{ t('dash.newMatchBody') }}</p>
    </NuxtLink>

    <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <p class="eyebrow">{{ t('dash.subscription') }}</p>
      <p class="mt-2 text-sm">
        {{ t('dash.plan') }} :
        <span
          class="font-medium"
          :class="{
            'text-(--color-signal)': org?.plan === 'trial',
            'text-(--color-ok-text)': org?.plan === 'active',
            'text-(--color-danger-text)': org?.plan === 'canceled',
          }"
        >
          {{ org?.plan ? t(`dash.plan.${org.plan}`) : '' }}
        </span>
        <span v-if="org?.stripe.subscriptionStatus" class="text-(--color-fg-soft)">
          ({{ org.stripe.subscriptionStatus }})
        </span>
      </p>
      <button
        v-if="org?.plan !== 'active'"
        :disabled="subscribing"
        class="mt-3 rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
        @click="subscribe"
      >
        {{ subscribing ? t('dash.redirecting') : t('dash.subscribe') }}
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">{{ t('dash.rentila') }}</p>
        <p class="mt-2 text-sm">
          <span :class="org?.rentila.connected ? 'text-(--color-ok-text)' : 'text-(--color-fg-soft)'">
            {{ org?.rentila.connected ? t('dash.connected') : t('dash.notConnected') }}
          </span>
        </p>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">{{ t('dash.bankBridge') }}</p>
        <p class="mt-2 text-sm">
          <span :class="org?.bridge.connected ? 'text-(--color-ok-text)' : 'text-(--color-fg-soft)'">
            {{ org?.bridge.connected ? t('dash.connected') : t('dash.notConnected') }}
          </span>
        </p>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">{{ t('dash.bankEb') }}</p>
        <p class="mt-2 text-sm">
          <span :class="org?.enablebanking.connected ? 'text-(--color-ok-text)' : 'text-(--color-fg-soft)'">
            {{ org?.enablebanking.connected ? `${t('dash.connected')} — ${org.enablebanking.aspspName}` : t('dash.notConnected') }}
          </span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
