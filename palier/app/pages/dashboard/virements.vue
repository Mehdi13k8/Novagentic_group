<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data, refresh } = await useFetch('/api/transactions')
const { data: unmatchedPayments, refresh: refreshUnmatched } = await useFetch('/api/payments/unmatched')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR')
}

const providerLabel: Record<string, string> = { bridge: 'Bridge', enablebanking: 'Enable Banking' }

// Which unmatched row's picker is open, and what's selected in it — one at a
// time, keyed by transaction id.
const linkingId = ref<string | null>(null)
const selectedPaymentId = ref('')
const linkError = ref('')
const busyId = ref<string | null>(null)

function openLinkPicker(txId: string) {
  linkError.value = ''
  selectedPaymentId.value = ''
  linkingId.value = linkingId.value === txId ? null : txId
}

async function confirmLink(txId: string) {
  if (!selectedPaymentId.value) return
  linkError.value = ''
  busyId.value = txId
  try {
    await $fetch(`/api/transactions/${txId}/link`, {
      method: 'POST',
      body: { paymentId: selectedPaymentId.value },
    })
    linkingId.value = null
    await Promise.all([refresh(), refreshUnmatched()])
  } catch (err: any) {
    linkError.value = err?.data?.statusMessage || 'Could not link'
  } finally {
    busyId.value = null
  }
}

async function unlink(txId: string) {
  busyId.value = txId
  try {
    await $fetch(`/api/transactions/${txId}/unlink`, { method: 'POST' })
    await Promise.all([refresh(), refreshUnmatched()])
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">Bank account</p>
      <h1 class="display mt-1 text-3xl">Virements reçus</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        Incoming transfers into your connected bank account(s), most recent first — and
        whether each one has been matched to a Rentila rent payment. Missed one? Link it
        yourself below.
      </p>
    </div>

    <!-- The "alert" — matches made recently, since Rentila's API can't be
         written back to (Phase 0 findings), this IS the notification: it
         tells you which payments to go mark as paid in Rentila yourself. -->
    <div
      v-if="data?.newMatchesCount"
      class="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm"
    >
      <p class="font-medium text-(--color-fg)">
        🔔 {{ data.newMatchesCount }} new match{{ data.newMatchesCount > 1 ? 'es' : '' }} in the last 24h
      </p>
      <p class="mt-1 text-(--color-fg-soft)">
        These transfers were just linked to a pending rent payment below — Rentila's own API
        can't be updated automatically (it's read-only), so mark them paid there yourself via
        the "Open in Rentila" link.
      </p>
    </div>

    <p v-if="!data?.items?.length" class="text-sm text-(--color-fg-soft)">
      No incoming transfers yet — connect a bank account from
      <NuxtLink to="/dashboard/integrations" class="underline">Integrations</NuxtLink>
      and sync, or check back after the next automatic sync (every 30 minutes).
    </p>

    <div v-else class="overflow-x-auto rounded-lg border border-(--color-line)">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-(--color-line) text-(--color-fg-soft)">
          <tr>
            <th class="px-4 py-3 font-normal">Date</th>
            <th class="px-4 py-3 font-normal">Description</th>
            <th class="px-4 py-3 font-normal">Amount</th>
            <th class="px-4 py-3 font-normal">Bank</th>
            <th class="px-4 py-3 font-normal">Matched rent payment</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="tx in data.items" :key="tx.id">
            <tr class="border-b border-(--color-line) last:border-0">
              <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(tx.date) }}</td>
              <td class="px-4 py-3">{{ tx.description || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">€{{ tx.amount.toFixed(2) }}</td>
              <td class="px-4 py-3 text-(--color-fg-soft)">{{ providerLabel[tx.provider] ?? tx.provider }}</td>
              <td class="px-4 py-3">
                <template v-if="tx.match">
                  <div class="flex items-center gap-2">
                    <span v-if="tx.matchedRecently" class="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-500">New</span>
                    <span>{{ tx.match.tenant ?? '—' }} · {{ tx.match.property ?? '—' }}</span>
                  </div>
                  <div class="mt-1 flex items-center gap-3">
                    <a
                      :href="tx.match.rentilaEditUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-(--color-cobalt) underline"
                    >
                      Open in Rentila ↗
                    </a>
                    <button
                      :disabled="busyId === tx.id"
                      class="text-xs text-(--color-fg-soft) underline disabled:opacity-50"
                      @click="unlink(tx.id)"
                    >
                      {{ busyId === tx.id ? 'Unlinking…' : 'Unlink' }}
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <span class="text-(--color-fg-soft)">Unmatched</span>
                    <button
                      class="text-xs text-(--color-cobalt) underline"
                      @click="openLinkPicker(tx.id)"
                    >
                      {{ linkingId === tx.id ? 'Cancel' : 'Link to payment' }}
                    </button>
                  </div>
                </template>
              </td>
            </tr>
            <tr v-if="linkingId === tx.id" class="border-b border-(--color-line) bg-(--color-bg) last:border-0">
              <td colspan="5" class="px-4 py-3">
                <div v-if="!unmatchedPayments?.items?.length" class="text-sm text-(--color-fg-soft)">
                  No pending rent payments to link — sync Rentila from
                  <NuxtLink to="/dashboard/integrations" class="underline">Integrations</NuxtLink>
                  first.
                </div>
                <div v-else class="flex flex-wrap items-center gap-3">
                  <select
                    v-model="selectedPaymentId"
                    class="rounded border border-(--color-line) bg-(--color-bg-raised) px-3 py-2 text-sm"
                  >
                    <option value="" disabled>Choose a pending rent payment…</option>
                    <option v-for="p in unmatchedPayments.items" :key="p.id" :value="p.id">
                      {{ formatDate(p.dueDate) }} · €{{ p.amount.toFixed(2) }} · {{ p.tenant ?? '—' }} · {{ p.property ?? '—' }}
                    </option>
                  </select>
                  <button
                    :disabled="!selectedPaymentId || busyId === tx.id"
                    class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    @click="confirmLink(tx.id)"
                  >
                    {{ busyId === tx.id ? 'Linking…' : 'Confirm link' }}
                  </button>
                  <p v-if="linkError" class="text-sm text-red-500">{{ linkError }}</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
