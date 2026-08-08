<script setup lang="ts">
/**
 * Vue d'ensemble — répond à « que dois-je faire aujourd'hui ? ».
 *
 * L'écran précédent affichait trois tuiles d'état de connexion et un encart
 * d'abonnement : rien sur l'argent. Les six indicateurs et la file « À
 * traiter » viennent de /api/dashboard/summary, l'abonnement a rejoint les
 * Réglages, là où on va quand on cherche une facture.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { money, monthLabel, shortMonth, fullDate } = useFormat()

const { data: org } = await useFetch('/api/org/me')
const { data: summary, status } = await useFetch('/api/dashboard/summary', { lazy: true })

const loading = computed(() => status.value === 'pending' && !summary.value)

/** Le premier jour : rien n'est branché, il n'y a donc aucun chiffre à montrer. */
const firstDay = computed(() => !org.value?.rentila.connected)

const steps = computed(() => [
  {
    title: t('fd.s1.title'),
    desc: t('fd.s1.desc'),
    done: Boolean(org.value?.rentila.connected),
    cta: org.value?.rentila.connected ? null : t('fd.s1.cta'),
  },
  {
    title: t('fd.s2.title'),
    desc: t('fd.s2.desc'),
    done: Boolean(org.value?.enablebanking.connected || org.value?.bridge.connected),
    cta: org.value?.rentila.connected ? t('fd.s2.cta') : null,
    locked: org.value?.rentila.connected ? null : t('fd.locked'),
  },
  {
    title: t('fd.s3.title'),
    desc: t('fd.s3.desc'),
    done: false,
    locked: t('fd.s3.locked'),
  },
])

const kpis = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    {
      label: t('kpi.collected'),
      value: money(s.collected, { cents: false }),
      sub: `${t('kpi.collectedSub')} ${money(s.expected, { cents: false })}`,
      tone: '',
    },
    {
      label: t('kpi.costs'),
      value: money(-s.costs, { cents: false }),
      sub: t('kpi.costsSub'),
      tone: 'text-(--color-danger-text)',
    },
    {
      label: t('kpi.net'),
      value: money(s.net, { signed: true, cents: false }),
      sub: t('kpi.netSub'),
      tone: s.net >= 0 ? 'text-(--color-ok-text)' : 'text-(--color-danger-text)',
    },
    {
      label: t('kpi.toReconcile'),
      value: String(s.toReconcile),
      sub: t('kpi.toReconcileSub'),
      tone: s.toReconcile ? 'text-(--color-signal-text)' : 'text-(--color-ok-text)',
    },
    {
      label: t('kpi.overdue'),
      value: s.overdue.properties
        ? `${s.overdue.properties} ${s.overdue.properties > 1 ? t('kpi.lots') : t('kpi.lot')}`
        : t('kpi.none'),
      sub: s.overdue.worst
        ? `${s.overdue.worst.property ?? '—'} · ${s.overdue.worst.tenant} · ${s.overdue.worst.daysLate} ${t('kpi.daysLate')}`
        : t('kpi.overdueNone'),
      tone: s.overdue.properties ? 'text-(--color-danger-text)' : 'text-(--color-ok-text)',
    },
    {
      label: t('kpi.occupancy'),
      value: `${s.occupancy.occupied} / ${s.occupancy.total}`,
      sub: t('kpi.occupancySub'),
      tone: '',
    },
  ]
})

/** Barres proportionnelles à l'attendu mensuel — sinon un mois faible paraît plein. */
const barScale = computed(() => {
  const s = summary.value
  if (!s) return 1
  return Math.max(s.expectedMonthly, ...s.collections.map((c) => c.collected), 1)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Parcours premier jour : trois étapes, et là l'ordre est réel — chacune
         a besoin de la précédente, donc la numérotation est justifiée ici. -->
    <section
      v-if="firstDay"
      class="max-w-3xl rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-6 sm:p-8"
    >
      <p class="eyebrow text-(--color-signal-text)">{{ t('fd.eyebrow') }}</p>
      <h2 class="display mt-2.5 text-2xl sm:text-3xl">{{ t('fd.welcome') }}</h2>
      <p class="mt-3 max-w-lg text-sm leading-relaxed text-(--color-fg-soft)">{{ t('fd.welcomeSub') }}</p>

      <ol class="mt-7 overflow-hidden rounded-lg border border-(--color-line)">
        <li
          v-for="(step, i) in steps"
          :key="step.title"
          class="flex flex-wrap items-center gap-4 border-b border-(--color-line) bg-(--color-bg-sunken) px-5 py-4 last:border-0"
        >
          <span
            class="eyebrow flex size-7 shrink-0 items-center justify-center rounded-full border text-[0.6rem]"
            :class="step.done
              ? 'border-(--color-ok-text) text-(--color-ok-text)'
              : 'border-(--color-line-strong) text-(--color-signal-text)'"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold">{{ step.title }}</p>
            <p class="mt-0.5 text-[13px] leading-relaxed text-(--color-fg-soft)">{{ step.desc }}</p>
          </div>
          <StatusPill v-if="step.done" tone="ok" :label="t('fd.done')" />
          <NuxtLink
            v-else-if="step.cta"
            to="/dashboard/integrations"
            class="shrink-0 rounded-md bg-(--color-cobalt) px-4 py-2.5 text-[13px] font-bold text-(--color-on-cobalt) transition-opacity hover:opacity-90"
          >
            {{ step.cta }}
          </NuxtLink>
          <span v-else-if="step.locked" class="eyebrow shrink-0 text-[0.6rem]">{{ step.locked }}</span>
        </li>
      </ol>

      <p class="eyebrow mt-5 text-[0.62rem] leading-relaxed normal-case">{{ t('fd.note') }}</p>
    </section>

    <template v-else>
      <div v-if="loading" class="flex flex-col gap-6" aria-busy="true">
        <div class="grid gap-px overflow-hidden rounded-lg border border-(--color-line) sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock v-for="i in 6" :key="i" height="7rem" rounded="rounded-none" :delay="i * 70" />
        </div>
        <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SkeletonBlock height="19rem" />
          <SkeletonBlock height="19rem" :delay="120" />
        </div>
      </div>

      <template v-else-if="summary">
        <div
          class="grid gap-px overflow-hidden rounded-lg border border-(--color-line) bg-(--color-line) sm:grid-cols-2 lg:grid-cols-3"
        >
          <div v-for="kpi in kpis" :key="kpi.label" class="flex flex-col gap-2 bg-(--color-bg-raised) px-6 py-5">
            <p class="eyebrow text-[0.65rem]">{{ kpi.label }}</p>
            <p class="display text-[23px] leading-none" :class="kpi.tone">{{ kpi.value }}</p>
            <p class="eyebrow text-[0.62rem] normal-case">{{ kpi.sub }}</p>
          </div>
        </div>

        <div class="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section class="overflow-hidden rounded-lg border border-(--color-line) bg-(--color-bg-raised)">
            <div class="flex items-center justify-between border-b border-(--color-line) px-5 py-3.5">
              <h2 class="eyebrow text-[0.68rem]">{{ t('overview.toProcess') }}</h2>
              <NuxtLink to="/dashboard/virements" class="eyebrow text-[0.65rem] text-(--color-cobalt)">
                {{ t('overview.seeAll') }}
              </NuxtLink>
            </div>

            <p v-if="!summary.todos.length" class="px-5 py-9 text-sm text-(--color-fg-soft)">
              {{ t('overview.allClear') }}
            </p>

            <NuxtLink
              v-for="todo in summary.todos"
              v-else
              :key="todo.kind + todo.id"
              :to="todo.kind === 'overdue' ? '/dashboard/tenants' : '/dashboard/virements'"
              class="flex items-center gap-3.5 border-b border-(--color-line) px-5 py-4 transition-colors last:border-0 hover:bg-(--color-bg-sunken)"
            >
              <span
                class="size-2 shrink-0 rounded-full"
                :class="todo.kind === 'overdue' ? 'bg-(--color-danger)' : 'bg-(--color-cobalt)'"
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm leading-snug">
                  <template v-if="todo.kind === 'overdue'">
                    {{ t('overview.overdueRow').replace('{tenant}', todo.tenant).replace('{days}', String(todo.daysLate)) }}
                  </template>
                  <template v-else>{{ todo.description || t('overview.unnamedTransfer') }}</template>
                </p>
                <p class="eyebrow mt-0.5 truncate text-[0.62rem] normal-case">
                  <template v-if="todo.kind === 'overdue'">
                    {{ todo.property ?? '—' }} · {{ t('overview.dueOn') }} {{ fullDate(todo.dueDate) }}
                  </template>
                  <template v-else>{{ t('overview.received') }} {{ fullDate(todo.date) }}</template>
                </p>
              </div>
              <span class="shrink-0 font-mono text-[0.72rem]">{{ money(todo.amount) }}</span>
            </NuxtLink>
          </section>

          <section class="rounded-lg border border-(--color-line) bg-(--color-bg-raised) p-5">
            <h2 class="eyebrow text-[0.68rem]">{{ t('overview.collections') }}</h2>
            <div class="mt-5 flex h-36 items-end gap-3.5">
              <div
                v-for="bar in summary.collections"
                :key="bar.month"
                class="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  class="w-full max-w-[34px] rounded-t-[3px] border border-(--color-line)"
                  :class="bar.month === summary.month ? 'bg-(--color-signal)' : 'bg-(--color-bg-sunken)'"
                  :style="{ height: `${Math.max(2, Math.round((bar.collected / barScale) * 100))}%` }"
                  :title="`${monthLabel(bar.month)} — ${money(bar.collected, { cents: false })}`"
                />
                <span class="eyebrow text-[0.58rem]">{{ shortMonth(bar.month) }}</span>
              </div>
            </div>
            <p class="eyebrow mt-4 text-[0.62rem] normal-case">
              {{ t('overview.expectedMonthly') }} {{ money(summary.expectedMonthly, { cents: false }) }}
            </p>
          </section>
        </div>
      </template>
    </template>
  </div>
</template>
