<script setup lang="ts">
/**
 * Grand livre — les écritures du mois, puis la synthèse 12 mois.
 *
 * L'écran ne portait que le graphique ; la maquette y attend d'abord le
 * détail ligne à ligne, parce que c'est ce qu'on vient y chercher (« qu'est-ce
 * qui compose ce chiffre ? »). Le graphique reste, en dessous.
 *
 * Une colonne de la maquette n'est pas reprise : « Compte ». Palier n'a pas de
 * plan comptable, et afficher un 706 ou un 614 plausible à côté de montants
 * réels inventerait une comptabilité que le produit ne tient pas.
 *
 * Le « Pack fiscal 2044 » de la maquette n'est pas repris non plus : rien ne
 * le génère côté serveur. L'export CSV, lui, est réel — il sort les lignes
 * effectivement affichées.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { locale, t } = useLocale()
const { money, fullDate, monthLabel } = useFormat()
const { push } = useToasts()

const month = ref<string>('')
const { data: ledger, status: ledgerStatus } = await useFetch('/api/ledger', {
  query: { month },
  lazy: true,
})
const { data } = await useFetch('/api/accounting/monthly', { lazy: true })

const ledgerLoading = computed(() => ledgerStatus.value === 'pending' && !ledger.value)

// Income/expenses is a good/bad pair, so it wears status-style colors, not
// arbitrary categorical hues (see dataviz skill's color-formula.md: "when a
// series means good/bad it wears status tokens"). Validated with
// scripts/validate_palette.js — plain green-500/red-500 FAILED the lightness
// band; this pair is the one that cleared all six checks.
//
// Revalidé après le passage au double thème : les surfaces ont changé
// (#0e0e0e -> #121214 en sombre, #fffefa en clair). Ces deux teintes tiennent
// des deux côtés — 4,97:1 sur la carte sombre, 3,73:1 sur la claire, au-dessus
// du seuil de 3:1 qui s'applique aux éléments graphiques non textuels. Elles
// restent donc figées volontairement, plutôt que suivre les tokens de thème.
const INCOME_COLOR = '#059669'
const EXPENSE_COLOR = '#ef4444'

const W = 760
const H = 320
const MARGIN = { top: 12, right: 12, bottom: 28, left: 56 }
const plotW = W - MARGIN.left - MARGIN.right
const plotH = H - MARGIN.top - MARGIN.bottom

function niceMax(value: number) {
  if (value <= 0) return 100
  const exp = Math.floor(Math.log10(value))
  const base = 10 ** exp
  const norm = value / base
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return niceNorm * base
}

/** Rounded-top, square-at-baseline bar path — SVG <rect rx> rounds all four corners, this doesn't. */
function roundedTopPath(x: number, y: number, w: number, h: number) {
  if (h <= 0) return ''
  const r = Math.min(4, h, w / 2)
  const bottom = y + h
  return `M${x},${bottom} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${bottom} Z`
}

// L'appli est bilingue : ces deux formats suivaient 'fr-FR' en dur, donc les
// mois et les milliers restaient français en anglais.
const localeTag = computed(() => (locale.value === 'en' ? 'en-GB' : 'fr-FR'))

function formatMonth(m: string) {
  const [year, monthNumber] = m.split('-').map(Number)
  return new Date(year!, monthNumber! - 1, 1).toLocaleDateString(localeTag.value, { month: 'short', year: '2-digit' })
}

function euro(n: number) {
  return `${n.toLocaleString(localeTag.value, { maximumFractionDigits: 0 })} €`
}

const chart = computed(() => {
  const months = data.value?.months ?? []
  const max = niceMax(Math.max(1, ...months.flatMap((m) => [m.income, m.expenses])))
  const groupW = plotW / Math.max(months.length, 1)
  const barW = Math.min(24, (groupW - 2) / 2) // 2px surface gap between the income/expense pair
  const pairW = barW * 2 + 2
  const groupOffset = (groupW - pairW) / 2

  const groups = months.map((m, i) => {
    const groupX = MARGIN.left + i * groupW
    const incomeX = groupX + groupOffset
    const expenseX = incomeX + barW + 2
    const incomeH = (m.income / max) * plotH
    const expenseH = (m.expenses / max) * plotH
    return {
      month: m.month,
      label: formatMonth(m.month),
      income: m.income,
      expenses: m.expenses,
      net: m.income - m.expenses,
      groupX,
      groupW,
      incomePath: roundedTopPath(incomeX, MARGIN.top + plotH - incomeH, barW, incomeH),
      expensePath: roundedTopPath(expenseX, MARGIN.top + plotH - expenseH, barW, expenseH),
    }
  })

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: Math.round(max * f),
    y: MARGIN.top + plotH - f * plotH,
  }))

  return { groups, ticks }
})

const hovered = ref<string | null>(null)
const hoveredGroup = computed(() => chart.value.groups.find((g) => g.month === hovered.value) ?? null)

/** Un champ CSV : guillemets doublés, et entouré dès qu'il contient un séparateur. */
function csvCell(value: string | number) {
  const text = String(value)
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function exportCsv() {
  const rows = ledger.value?.entries ?? []
  if (!rows.length) return
  const header = [t('livre.col.date'), t('livre.col.label'), t('livre.col.lot'), t('livre.col.debit'), t('livre.col.credit')]
  // Point-virgule : Excel en locale française scinde sur ';', pas sur ','.
  const lines = [
    header.map(csvCell).join(';'),
    ...rows.map((entry) =>
      [
        new Date(entry.date).toISOString().slice(0, 10),
        entry.label,
        entry.property ?? '',
        entry.debit ? entry.debit.toFixed(2) : '',
        entry.credit ? entry.credit.toFixed(2) : '',
      ]
        .map(csvCell)
        .join(';'),
    ),
  ]
  // BOM : sans lui Excel lit l'UTF-8 comme du latin-1 et casse les accents.
  const blob = new Blob([`﻿${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `palier-grand-livre-${ledger.value?.month}.csv`
  link.click()
  URL.revokeObjectURL(url)
  push(`${t('livre.toast.csv')} — ${monthLabel(ledger.value?.month)}`, { tone: 'ok' })
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="flex items-center gap-2">
        <span class="eyebrow text-[0.6rem]">{{ t('livre.month') }}</span>
        <select
          v-model="month"
          class="eyebrow rounded-md border border-(--color-line) px-3 py-2 text-[0.65rem] text-(--color-fg)"
        >
          <option value="">{{ t('livre.currentMonth') }}</option>
          <option v-for="m in ledger?.availableMonths ?? []" :key="m" :value="m">{{ monthLabel(m) }}</option>
        </select>
      </label>

      <button
        type="button"
        :disabled="!ledger?.entries?.length"
        class="eyebrow rounded-md border border-(--color-line) px-4 py-2 text-[0.65rem] transition-colors hover:border-(--color-cobalt) disabled:opacity-40"
        @click="exportCsv"
      >
        {{ t('livre.exportCsv') }}
      </button>
    </div>

    <div v-if="ledgerLoading" aria-busy="true"><SkeletonBlock height="18rem" /></div>

    <EmptyState
      v-else-if="!ledger?.entries?.length"
      :eyebrow="t('livre.empty.eyebrow')"
      :title="t('livre.empty.title')"
      :body="t('livre.empty.body')"
      :cta="t('livre.empty.cta')"
      to="/dashboard/integrations"
    />

    <template v-else>
      <div class="overflow-x-auto rounded-lg border border-(--color-line) bg-(--color-bg-raised)">
        <table class="w-full min-w-[46rem] text-left">
          <thead>
            <tr class="border-b border-(--color-line)">
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal">{{ t('livre.col.date') }}</th>
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal">{{ t('livre.col.label') }}</th>
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal">{{ t('livre.col.lot') }}</th>
              <th class="eyebrow px-5 py-2.5 text-right text-[0.6rem] font-normal">{{ t('livre.col.debit') }}</th>
              <th class="eyebrow px-5 py-2.5 text-right text-[0.6rem] font-normal">{{ t('livre.col.credit') }}</th>
              <th class="eyebrow px-5 py-2.5 text-right text-[0.6rem] font-normal">{{ t('livre.col.balance') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in ledger.entries" :key="entry.id" class="border-b border-(--color-line)">
              <td class="px-5 py-3 font-mono text-[0.66rem] text-(--color-fg-soft)">{{ fullDate(entry.date) }}</td>
              <td class="px-5 py-3">
                <span class="text-[13.5px]">{{ entry.label }}</span>
                <!-- « Les écritures rapprochées portent la référence du
                     virement » — l'état ne tient pas qu'à la couleur. -->
                <StatusPill v-if="entry.reconciled" class="ml-2" tone="ok" :label="t('livre.reconciled')" />
              </td>
              <td class="px-5 py-3 font-mono text-[0.62rem] text-(--color-fg-soft)">{{ entry.property ?? '—' }}</td>
              <td class="px-5 py-3 text-right font-mono text-[0.7rem] text-(--color-danger-text)">
                {{ entry.debit ? money(entry.debit) : '' }}
              </td>
              <td class="px-5 py-3 text-right font-mono text-[0.7rem] text-(--color-ok-text)">
                {{ entry.credit ? money(entry.credit) : '' }}
              </td>
              <td class="px-5 py-3 text-right font-mono text-[0.7rem]">{{ money(entry.balance) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-(--color-bg-sunken)">
              <td />
              <td class="eyebrow px-5 py-3 text-[0.62rem]">{{ t('livre.totals') }}</td>
              <td />
              <td class="px-5 py-3 text-right font-mono text-[0.7rem] text-(--color-danger-text)">
                {{ money(ledger.totals.debit) }}
              </td>
              <td class="px-5 py-3 text-right font-mono text-[0.7rem] text-(--color-ok-text)">
                {{ money(ledger.totals.credit) }}
              </td>
              <td class="px-5 py-3 text-right font-mono text-[0.7rem] font-medium">{{ money(ledger.totals.balance) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p class="eyebrow text-[0.62rem] normal-case">{{ t('livre.note') }}</p>
    </template>

    <section
      v-if="data?.months?.some((m) => m.income || m.expenses)"
      class="mt-3 rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5"
    >
      <h2 class="eyebrow text-[0.68rem]">{{ t('dash.incomeVsCosts') }}</h2>

      <div class="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p class="eyebrow text-[0.62rem]">{{ t('dash.income12') }}</p>
          <p class="display mt-1 text-2xl" :style="{ color: INCOME_COLOR }">{{ euro(data?.totalIncome ?? 0) }}</p>
        </div>
        <div>
          <p class="eyebrow text-[0.62rem]">{{ t('dash.costs12') }}</p>
          <p class="display mt-1 text-2xl" :style="{ color: EXPENSE_COLOR }">{{ euro(data?.totalExpenses ?? 0) }}</p>
        </div>
        <div>
          <p class="eyebrow text-[0.62rem]">{{ t('acc.net') }}</p>
          <p class="display mt-1 text-2xl" :style="{ color: (data?.net ?? 0) >= 0 ? INCOME_COLOR : EXPENSE_COLOR }">
            {{ (data?.net ?? 0) >= 0 ? '+' : '' }}{{ euro(data?.net ?? 0) }}
          </p>
        </div>
      </div>

      <!-- legend — always present for 2+ series -->
      <div class="mt-5 flex items-center gap-4 text-xs text-(--color-fg-soft)">
        <span class="flex items-center gap-1.5">
          <span class="inline-block size-2.5 rounded-full" :style="{ background: INCOME_COLOR }" />
          {{ t('dash.col.income') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block size-2.5 rounded-full" :style="{ background: EXPENSE_COLOR }" />
          {{ t('dash.col.costs') }}
        </span>
      </div>

      <div class="relative mt-3">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="t('acc.chartAlt')">
          <!-- gridlines: hairline, recessive, one-step-off-surface -->
          <g v-for="tick in chart.ticks" :key="tick.value">
            <line
              :x1="MARGIN.left"
              :x2="W - MARGIN.right"
              :y1="tick.y"
              :y2="tick.y"
              stroke="var(--color-line)"
              stroke-width="1"
            />
            <text
              :x="MARGIN.left - 8"
              :y="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
              font-size="10"
              fill="var(--color-fg-soft)"
            >
              {{ euro(tick.value) }}
            </text>
          </g>

          <!-- bars -->
          <g v-for="g in chart.groups" :key="g.month">
            <path :d="g.incomePath" :fill="INCOME_COLOR" />
            <path :d="g.expensePath" :fill="EXPENSE_COLOR" />
            <text
              :x="g.groupX + g.groupW / 2"
              :y="H - MARGIN.bottom + 14"
              text-anchor="middle"
              font-size="10"
              fill="var(--color-fg-soft)"
            >
              {{ g.label }}
            </text>
            <!-- hover hit target: the whole month column, bigger than the thin bars themselves -->
            <rect
              :x="g.groupX"
              :y="MARGIN.top"
              :width="g.groupW"
              :height="plotH"
              fill="transparent"
              @mouseenter="hovered = g.month"
              @mouseleave="hovered = null"
            />
          </g>
        </svg>

        <!-- tooltip -->
        <div
          v-if="hoveredGroup"
          class="pointer-events-none absolute top-0 z-10 w-36 -translate-x-1/2 rounded border border-(--color-line) bg-(--color-bg) p-2 text-xs shadow-lg"
          :style="{ left: `${((hoveredGroup.groupX + hoveredGroup.groupW / 2) / W) * 100}%` }"
        >
          <p class="font-medium text-(--color-fg)">{{ hoveredGroup.label }}</p>
          <p :style="{ color: INCOME_COLOR }">{{ t('dash.col.income') }} : {{ euro(hoveredGroup.income) }}</p>
          <p :style="{ color: EXPENSE_COLOR }">{{ t('dash.col.costs') }} : {{ euro(hoveredGroup.expenses) }}</p>
          <p class="mt-1 border-t border-(--color-line) pt-1 text-(--color-fg-soft)">
            {{ t('acc.net') }} : {{ hoveredGroup.net >= 0 ? '+' : '' }}{{ euro(hoveredGroup.net) }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
