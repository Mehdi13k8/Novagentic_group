<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data } = await useFetch('/api/accounting/monthly')

// Income/expenses is a good/bad pair, so it wears status-style colors, not
// arbitrary categorical hues (see dataviz skill's color-formula.md: "when a
// series means good/bad it wears status tokens"). Validated with
// scripts/validate_palette.js against this app's actual dark surface
// (#0e0e0e) — plain green-500/red-500 FAILED the lightness band; this pair
// is the one that cleared all six checks.
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

function formatMonth(m: string) {
  const [year, month] = m.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

function euro(n: number) {
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
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
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">Accounting</p>
      <h1 class="display mt-1 text-3xl">Income vs. costs</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        Rent actually received (paid in Rentila, or matched to a bank transfer) against
        every recorded apartment cost — last 12 months.
      </p>
    </div>

    <div v-if="!data?.months?.some((m) => m.income || m.expenses)" class="text-sm text-(--color-fg-soft)">
      Nothing to chart yet — connect Rentila and sync from
      <NuxtLink to="/dashboard/integrations" class="underline">Integrations</NuxtLink>
      first.
    </div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
          <p class="eyebrow">Income (12mo)</p>
          <p class="display mt-2 text-2xl" :style="{ color: INCOME_COLOR }">{{ euro(data?.totalIncome ?? 0) }}</p>
        </div>
        <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
          <p class="eyebrow">Costs (12mo)</p>
          <p class="display mt-2 text-2xl" :style="{ color: EXPENSE_COLOR }">{{ euro(data?.totalExpenses ?? 0) }}</p>
        </div>
        <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
          <p class="eyebrow">Net</p>
          <p
            class="display mt-2 text-2xl"
            :style="{ color: (data?.net ?? 0) >= 0 ? INCOME_COLOR : EXPENSE_COLOR }"
          >
            {{ (data?.net ?? 0) >= 0 ? '+' : '' }}{{ euro(data?.net ?? 0) }}
          </p>
        </div>
      </div>

      <div class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
        <!-- legend — always present for 2+ series -->
        <div class="flex items-center gap-4 text-xs text-(--color-fg-soft)">
          <span class="flex items-center gap-1.5">
            <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: INCOME_COLOR }" />
            Income
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: EXPENSE_COLOR }" />
            Costs
          </span>
        </div>

        <div class="relative mt-3">
          <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-label="Monthly income vs. costs, last 12 months">
            <!-- gridlines: hairline, recessive, one-step-off-surface -->
            <g v-for="t in chart.ticks" :key="t.value">
              <line
                :x1="MARGIN.left"
                :x2="W - MARGIN.right"
                :y1="t.y"
                :y2="t.y"
                stroke="var(--color-line)"
                stroke-width="1"
              />
              <text :x="MARGIN.left - 8" :y="t.y" text-anchor="end" dominant-baseline="middle" font-size="10" fill="var(--color-fg-soft)">
                {{ euro(t.value) }}
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
            <p :style="{ color: INCOME_COLOR }">Income: {{ euro(hoveredGroup.income) }}</p>
            <p :style="{ color: EXPENSE_COLOR }">Costs: {{ euro(hoveredGroup.expenses) }}</p>
            <p class="mt-1 border-t border-(--color-line) pt-1 text-(--color-fg-soft)">
              Net: {{ hoveredGroup.net >= 0 ? '+' : '' }}{{ euro(hoveredGroup.net) }}
            </p>
          </div>
        </div>
      </div>

      <!-- table view — same data, accessible without relying on the chart -->
      <div class="overflow-x-auto rounded-lg border border-(--color-line)">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-(--color-line) text-(--color-fg-soft)">
            <tr>
              <th class="px-4 py-3 font-normal">Month</th>
              <th class="px-4 py-3 font-normal">Income</th>
              <th class="px-4 py-3 font-normal">Costs</th>
              <th class="px-4 py-3 font-normal">Net</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in chart.groups" :key="g.month" class="border-b border-(--color-line) last:border-0">
              <td class="px-4 py-3">{{ g.label }}</td>
              <td class="px-4 py-3">{{ euro(g.income) }}</td>
              <td class="px-4 py-3">{{ euro(g.expenses) }}</td>
              <td class="px-4 py-3" :style="{ color: g.net >= 0 ? INCOME_COLOR : EXPENSE_COLOR }">
                {{ g.net >= 0 ? '+' : '' }}{{ euro(g.net) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
