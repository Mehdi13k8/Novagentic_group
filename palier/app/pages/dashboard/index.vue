<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

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
      <p class="eyebrow">Overview</p>
      <h1 class="display mt-1 text-3xl">{{ org?.name }}</h1>
    </div>

    <NuxtLink
      v-if="transactions?.newMatchesCount"
      to="/dashboard/virements"
      class="rounded-lg border border-green-500/40 bg-green-500/10 p-5 text-sm transition-colors hover:border-green-500"
    >
      <p class="font-medium text-(--color-fg)">
        🔔 {{ transactions.newMatchesCount }} new rent payment match{{ transactions.newMatchesCount > 1 ? 'es' : '' }}
      </p>
      <p class="mt-1 text-(--color-fg-soft)">A tenant's transfer just matched a pending rent — see Virements →</p>
    </NuxtLink>

    <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
      <p class="eyebrow">Subscription</p>
      <p class="mt-2 text-sm">
        Plan:
        <span
          class="font-medium"
          :class="{
            'text-(--color-signal)': org?.plan === 'trial',
            'text-green-500': org?.plan === 'active',
            'text-red-500': org?.plan === 'canceled',
          }"
        >
          {{ org?.plan }}
        </span>
        <span v-if="org?.stripe.subscriptionStatus" class="text-(--color-fg-soft)">
          ({{ org.stripe.subscriptionStatus }})
        </span>
      </p>
      <button
        v-if="org?.plan !== 'active'"
        :disabled="subscribing"
        class="mt-3 rounded bg-(--color-cobalt) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        @click="subscribe"
      >
        {{ subscribing ? 'Redirecting…' : 'Subscribe — €3/month' }}
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">Rentila</p>
        <p class="mt-2 text-sm">
          <span :class="org?.rentila.connected ? 'text-green-500' : 'text-(--color-fg-soft)'">
            {{ org?.rentila.connected ? 'Connected' : 'Not connected' }}
          </span>
        </p>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">Bank (Bridge)</p>
        <p class="mt-2 text-sm">
          <span :class="org?.bridge.connected ? 'text-green-500' : 'text-(--color-fg-soft)'">
            {{ org?.bridge.connected ? 'Connected' : 'Not connected' }}
          </span>
        </p>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/integrations"
        class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5 transition-colors hover:border-(--color-cobalt)"
      >
        <p class="eyebrow">Bank (Enable Banking)</p>
        <p class="mt-2 text-sm">
          <span :class="org?.enablebanking.connected ? 'text-green-500' : 'text-(--color-fg-soft)'">
            {{ org?.enablebanking.connected ? `Connected — ${org.enablebanking.aspspName}` : 'Not connected' }}
          </span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
