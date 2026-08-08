<script setup lang="ts">
/**
 * Rapprochement — l'écran central du produit.
 *
 * Avant : un tableau brut où le rapprochement n'était qu'une colonne parmi
 * cinq, et le rattachement manuel s'ouvrait dans une ligne de tableau
 * supplémentaire. Maintenant : des onglets par état, le virement et l'écriture
 * face à face, et un panneau d'association qui se déplie sous la ligne.
 *
 * Deux écarts assumés par rapport à la maquette :
 *
 * 1. Pas d'onglet « À valider » ni de score de confiance en pourcentage. Le
 *    moteur (server/utils/reconcile.ts) rapproche ou ne rapproche pas — il n'y
 *    a pas de file de propositions en attente de validation, et aucun
 *    pourcentage n'est stocké. Les onglets reprennent donc les états réels, et
 *    la pastille affiche le niveau réel de Match.confidence. Afficher « 87 % »
 *    serait un chiffre inventé sur un écran qui décide d'argent.
 *
 * 2. Pas d'association multi-écritures. Les index uniques partiels sur
 *    Payment.matchedTransactionId et BankTransaction.matchedPaymentId rendent
 *    le lien un-à-un structurel — c'est l'invariant de sûreté du produit
 *    (« un virement ne peut pas solder deux échéances »). Le paiement partiel
 *    ou groupé demande un changement de schéma, pas un changement d'écran.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { money, fullDate } = useFormat()
const { push } = useToasts()

const { data, refresh, status } = await useFetch('/api/transactions', { lazy: true })
const { data: candidates, refresh: refreshCandidates } = await useFetch('/api/payments/unmatched', { lazy: true })

const loading = computed(() => status.value === 'pending' && !data.value)

type TabId = 'todo' | 'auto' | 'manual' | 'all'
const tab = ref<TabId>('todo')

const buckets = computed(() => {
  const items = data.value?.items ?? []
  return {
    todo: items.filter((tx) => !tx.match),
    auto: items.filter((tx) => tx.match && tx.confidence !== 'manual'),
    manual: items.filter((tx) => tx.match && tx.confidence === 'manual'),
    all: items,
  }
})

const tabs: { id: TabId; key: string }[] = [
  { id: 'todo', key: 'rap.tab.todo' },
  { id: 'auto', key: 'rap.tab.auto' },
  { id: 'manual', key: 'rap.tab.manual' },
  { id: 'all', key: 'rap.tab.all' },
]

const rows = computed(() => buckets.value[tab.value])

const confidenceLabel: Record<string, { tone: 'ok' | 'signal' | 'cobalt'; key: string }> = {
  exact: { tone: 'ok', key: 'rap.conf.exact' },
  partial: { tone: 'signal', key: 'rap.conf.partial' },
  manual: { tone: 'cobalt', key: 'rap.conf.manual' },
}

const openId = ref<string | null>(null)
const busyId = ref<string | null>(null)
const errorId = ref<string | null>(null)
const errorText = ref('')

function toggle(txId: string) {
  errorId.value = null
  openId.value = openId.value === txId ? null : txId
}

/**
 * Les échéances dont le montant tombe juste remontent en tête : c'est presque
 * toujours la bonne, et la faire chercher dans une liste triée par date est
 * exactement le travail que Palier est censé supprimer.
 */
function candidatesFor(amount: number) {
  const items = [...(candidates.value?.items ?? [])]
  return items.sort((a, b) => {
    const da = Math.abs(a.amount - amount)
    const db = Math.abs(b.amount - amount)
    if (da < 0.01 && db >= 0.01) return -1
    if (db < 0.01 && da >= 0.01) return 1
    return da - db
  })
}

async function link(txId: string, paymentId: string, label: string) {
  busyId.value = txId
  errorId.value = null
  try {
    await $fetch(`/api/transactions/${txId}/link`, { method: 'POST', body: { paymentId } })
    openId.value = null
    await Promise.all([refresh(), refreshCandidates()])
    push(`${t('rap.toast.linked')} — ${label}`, {
      tone: 'ok',
      actionLabel: t('rap.undo'),
      action: () => unlink(txId, { silent: true }),
    })
  } catch (err: unknown) {
    errorId.value = txId
    errorText.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || t('vir.linkFailed')
  } finally {
    busyId.value = null
  }
}

async function unlink(txId: string, options: { silent?: boolean } = {}) {
  busyId.value = txId
  try {
    await $fetch(`/api/transactions/${txId}/unlink`, { method: 'POST' })
    await Promise.all([refresh(), refreshCandidates()])
    if (!options.silent) push(t('rap.toast.undone'), { tone: 'signal' })
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div v-if="loading" class="flex flex-col gap-4" aria-busy="true">
      <SkeletonBlock height="2.5rem" />
      <SkeletonBlock height="22rem" :delay="100" />
    </div>

    <EmptyState
      v-else-if="!data?.items?.length"
      :eyebrow="t('rap.empty.eyebrow')"
      :title="t('rap.empty.title')"
      :body="t('rap.empty.body')"
      :cta="t('rap.empty.cta')"
      to="/dashboard/integrations"
    />

    <template v-else>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="eyebrow rounded-md border px-3.5 py-2 text-[0.65rem] transition-colors"
          :class="tab === item.id
            ? 'border-(--color-fg) bg-(--color-fg) text-(--color-bg)'
            : 'border-(--color-line) text-(--color-fg-soft) hover:text-(--color-fg)'"
          :aria-pressed="tab === item.id"
          @click="tab = item.id"
        >
          {{ t(item.key) }} · {{ buckets[item.id].length }}
        </button>
      </div>

      <div class="overflow-hidden rounded-lg border border-(--color-line) bg-(--color-bg-raised)">
        <div
          class="hidden grid-cols-[1.1fr_1.5rem_1.2fr_9rem_11rem] items-center gap-4 border-b border-(--color-line) px-5 py-2.5 lg:grid"
        >
          <span class="eyebrow text-[0.6rem]">{{ t('rap.col.transfer') }}</span>
          <span />
          <span class="eyebrow text-[0.6rem]">{{ t('rap.col.entry') }}</span>
          <span class="eyebrow text-[0.6rem]">{{ t('rap.col.state') }}</span>
          <span />
        </div>

        <p v-if="!rows.length" class="eyebrow px-5 py-9 text-[0.7rem] normal-case">{{ t('rap.emptyTab') }}</p>

        <div v-for="tx in rows" :key="tx.id" class="border-b border-(--color-line) last:border-0">
          <div class="grid items-center gap-3 px-5 py-4 lg:grid-cols-[1.1fr_1.5rem_1.2fr_9rem_11rem] lg:gap-4">
            <div class="min-w-0">
              <p class="truncate font-mono text-[0.68rem] tracking-wide">
                {{ tx.description || t('overview.unnamedTransfer') }}
              </p>
              <p class="eyebrow mt-1 text-[0.62rem] normal-case">
                {{ fullDate(tx.date) }} · {{ money(tx.amount) }}
              </p>
            </div>

            <span class="hidden text-(--color-fg-soft) lg:block" aria-hidden="true">→</span>

            <div class="min-w-0">
              <template v-if="tx.match">
                <p class="text-sm leading-snug">{{ tx.match.tenant ?? t('rap.noTenant') }}</p>
                <p class="eyebrow mt-0.5 truncate text-[0.62rem] normal-case">
                  {{ tx.match.property ?? '—' }} · {{ money(tx.match.amount) }}
                </p>
              </template>
              <template v-else>
                <p class="text-sm leading-snug text-(--color-fg-soft)">{{ t('rap.noEntry') }}</p>
                <p class="eyebrow mt-0.5 text-[0.62rem] normal-case">{{ t('rap.noEntryMeta') }}</p>
              </template>
            </div>

            <div>
              <StatusPill
                v-if="tx.match && tx.confidence"
                :tone="confidenceLabel[tx.confidence].tone"
                :label="t(confidenceLabel[tx.confidence].key)"
              />
              <StatusPill v-else-if="tx.match" tone="ok" :label="t('rap.conf.reconciled')" />
              <StatusPill v-else tone="signal" :label="t('rap.conf.none')" />
            </div>

            <div class="flex flex-wrap justify-start gap-2 lg:justify-end">
              <template v-if="tx.match">
                <a
                  :href="tx.match.rentilaEditUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="eyebrow rounded-md border border-(--color-line) px-3 py-2 text-[0.62rem] text-(--color-cobalt) transition-colors hover:border-(--color-cobalt)"
                >
                  {{ t('vir.openRentila') }}
                </a>
                <button
                  type="button"
                  :disabled="busyId === tx.id"
                  class="eyebrow px-1 py-2 text-[0.62rem] underline underline-offset-2 disabled:opacity-50"
                  @click="unlink(tx.id)"
                >
                  {{ busyId === tx.id ? t('vir.unlinking') : t('rap.undo') }}
                </button>
              </template>
              <button
                v-else
                type="button"
                class="eyebrow rounded-md border border-(--color-cobalt)/60 px-3 py-2 text-[0.62rem] text-(--color-cobalt) transition-colors hover:border-(--color-cobalt)"
                :aria-expanded="openId === tx.id"
                @click="toggle(tx.id)"
              >
                {{ openId === tx.id ? t('vir.cancel') : t('rap.assign') }}
              </button>
            </div>
          </div>

          <!-- Panneau d'association : les échéances en attente présentées comme
               des cibles cliquables, pas comme un <select> déguisé. -->
          <div v-if="openId === tx.id" class="border-t border-(--color-line) bg-(--color-bg-sunken) px-5 py-4">
            <p class="eyebrow text-[0.62rem]">{{ t('rap.assignTo') }}</p>

            <p v-if="!candidates?.items?.length" class="mt-3 text-sm text-(--color-fg-soft)">
              {{ t('vir.noPending') }}
              <NuxtLink to="/dashboard/integrations" class="underline">{{ t('nav.banque') }}</NuxtLink>.
            </p>

            <div v-else class="mt-3 flex flex-col gap-2">
              <button
                v-for="candidate in candidatesFor(tx.amount)"
                :key="candidate.id"
                type="button"
                :disabled="busyId === tx.id"
                class="flex items-center justify-between gap-4 rounded-md border border-(--color-line) bg-(--color-bg-raised) px-4 py-3 text-left transition-colors hover:border-(--color-cobalt) disabled:opacity-50"
                @click="link(tx.id, candidate.id, candidate.tenant ?? candidate.property ?? '')"
              >
                <span class="min-w-0">
                  <span class="block truncate text-[13.5px]">{{ candidate.tenant ?? t('rap.noTenant') }}</span>
                  <span class="eyebrow mt-0.5 block truncate text-[0.6rem] normal-case">
                    {{ candidate.property ?? '—' }} · {{ t('overview.dueOn') }} {{ fullDate(candidate.dueDate) }}
                  </span>
                </span>
                <span class="flex shrink-0 items-center gap-3">
                  <StatusPill
                    v-if="Math.abs(candidate.amount - tx.amount) < 0.01"
                    tone="ok"
                    :label="t('rap.exactAmount')"
                  />
                  <span class="font-mono text-[0.68rem]">{{ money(candidate.amount) }}</span>
                </span>
              </button>
            </div>

            <p v-if="errorId === tx.id" class="mt-3 text-sm text-(--color-danger-text)">{{ errorText }}</p>
          </div>
        </div>
      </div>

      <p class="eyebrow text-[0.62rem] normal-case">{{ t('rap.note') }}</p>
    </template>
  </div>
</template>
