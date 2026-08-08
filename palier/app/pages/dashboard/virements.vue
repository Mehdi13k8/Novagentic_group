<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { locale, t } = useLocale()
const { data, refresh } = await useFetch('/api/transactions')
const { data: unmatchedPayments, refresh: refreshUnmatched } = await useFetch('/api/payments/unmatched')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'fr-FR')
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
    linkError.value = err?.data?.statusMessage || t('vir.linkFailed')
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
      <p class="eyebrow">{{ t('dash.bankAccount') }}</p>
      <h1 class="display mt-1 text-3xl">{{ t('vir.title') }}</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        {{ t('vir.lede') }}
      </p>
    </div>

    <!-- The "alert" — matches made recently, since Rentila's API can't be
         written back to (Phase 0 findings), this IS the notification: it
         tells you which payments to go mark as paid in Rentila yourself. -->
    <div
      v-if="data?.newMatchesCount"
      class="rounded-lg border border-(--color-ok-text)/40 bg-(--color-ok-text)/10 p-4 text-sm"
    >
      <p class="font-medium text-(--color-fg)">
        🔔 {{ data.newMatchesCount }} {{ data.newMatchesCount > 1 ? t('vir.alertN') : t('vir.alert1') }}
      </p>
      <p class="mt-1 text-(--color-fg-soft)">
        {{ t('vir.alertBody') }}
      </p>
    </div>

    <p v-if="!data?.items?.length" class="text-sm text-(--color-fg-soft)">
      {{ t('vir.empty') }}
      <NuxtLink to="/dashboard/integrations" class="underline">{{ t('nav.integrations') }}</NuxtLink>
      {{ t('vir.empty2') }}
    </p>

    <div v-else class="overflow-x-auto rounded-lg border border-(--color-line)">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-(--color-line) text-(--color-fg-soft)">
          <tr>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.date') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.description') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.amount') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.bank') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.matchedRent') }}</th>
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
                    <span v-if="tx.matchedRecently" class="rounded bg-(--color-ok-text)/20 px-1.5 py-0.5 text-xs text-(--color-ok-text)">{{ t('vir.new') }}</span>
                    <span>{{ tx.match.tenant ?? '—' }} · {{ tx.match.property ?? '—' }}</span>
                  </div>
                  <div class="mt-1 flex items-center gap-3">
                    <a
                      :href="tx.match.rentilaEditUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-(--color-cobalt) underline"
                    >
                      {{ t('vir.openRentila') }}
                    </a>
                    <button
                      :disabled="busyId === tx.id"
                      class="text-xs text-(--color-fg-soft) underline disabled:opacity-50"
                      @click="unlink(tx.id)"
                    >
                      {{ busyId === tx.id ? t('vir.unlinking') : t('vir.unlink') }}
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <span class="text-(--color-fg-soft)">{{ t('dash.unmatched') }}</span>
                    <button
                      class="text-xs text-(--color-cobalt) underline"
                      @click="openLinkPicker(tx.id)"
                    >
                      {{ linkingId === tx.id ? t('vir.cancel') : t('vir.link') }}
                    </button>
                  </div>
                </template>
              </td>
            </tr>
            <tr v-if="linkingId === tx.id" class="border-b border-(--color-line) bg-(--color-bg) last:border-0">
              <td colspan="5" class="px-4 py-3">
                <div v-if="!unmatchedPayments?.items?.length" class="text-sm text-(--color-fg-soft)">
                  {{ t('vir.noPending') }}
                  <NuxtLink to="/dashboard/integrations" class="underline">{{ t('nav.integrations') }}</NuxtLink>.
                </div>
                <div v-else class="flex flex-wrap items-center gap-3">
                  <select
                    v-model="selectedPaymentId"
                    class="rounded border border-(--color-line) bg-(--color-bg-raised) px-3 py-2 text-sm"
                  >
                    <option value="" disabled>{{ t('vir.choose') }}</option>
                    <option v-for="p in unmatchedPayments.items" :key="p.id" :value="p.id">
                      {{ formatDate(p.dueDate) }} · €{{ p.amount.toFixed(2) }} · {{ p.tenant ?? '—' }} · {{ p.property ?? '—' }}
                    </option>
                  </select>
                  <button
                    :disabled="!selectedPaymentId || busyId === tx.id"
                    class="rounded bg-(--color-cobalt) px-3 py-2 text-sm font-medium text-(--color-on-cobalt) disabled:opacity-50"
                    @click="confirmLink(tx.id)"
                  >
                    {{ busyId === tx.id ? t('vir.linking') : t('vir.confirm') }}
                  </button>
                  <p v-if="linkError" class="text-sm text-(--color-danger-text)">{{ linkError }}</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
