<script setup lang="ts">
/**
 * Biens — une carte par lot, avec l'état du loyer du mois.
 *
 * Écran neuf : il existait en maquette, pas en code. Il n'y a pas de bouton
 * « Ajouter un lot » comme dans la maquette — les lots viennent de Rentila en
 * lecture seule, un formulaire de création ici n'écrirait nulle part.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { money, fullDate } = useFormat()

const { data, status } = await useFetch('/api/properties', { lazy: true })
const loading = computed(() => status.value === 'pending' && !data.value)

const statusPill: Record<string, { tone: 'ok' | 'signal' | 'danger' | 'neutral'; key: string }> = {
  collected: { tone: 'ok', key: 'biens.status.collected' },
  pending: { tone: 'signal', key: 'biens.status.pending' },
  late: { tone: 'danger', key: 'biens.status.late' },
  vacant: { tone: 'neutral', key: 'biens.status.vacant' },
}
</script>

<template>
  <div>
    <div v-if="loading" class="grid gap-px overflow-hidden rounded-lg border border-(--color-line)" aria-busy="true">
      <div class="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonBlock v-for="i in 6" :key="i" height="11rem" rounded="rounded-none" :delay="i * 60" />
      </div>
    </div>

    <EmptyState
      v-else-if="!data?.items?.length"
      :eyebrow="t('biens.empty.eyebrow')"
      :title="t('biens.empty.title')"
      :body="t('biens.empty.body')"
      :cta="t('biens.empty.cta')"
      to="/dashboard/integrations"
    />

    <div
      v-else
      class="grid gap-px overflow-hidden rounded-lg border border-(--color-line) bg-(--color-line) sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="lot in data.items"
        :key="lot.id"
        class="flex flex-col gap-2.5 bg-(--color-bg-raised) p-6"
      >
        <div class="flex items-start justify-between gap-2.5">
          <p class="eyebrow text-[0.62rem]">{{ lot.city ?? t('biens.noCity') }}</p>
          <StatusPill
            :tone="statusPill[lot.status].tone"
            :label="lot.status === 'late'
              ? `${t('biens.status.late')} ${lot.daysLate} ${t('kpi.daysLate')}`
              : t(statusPill[lot.status].key)"
          />
        </div>

        <h2 class="display text-lg leading-tight">{{ lot.title }}</h2>

        <p class="text-[13.5px] text-(--color-fg-soft)">
          {{ lot.tenants.length ? lot.tenants.join(' · ') : t('biens.vacantLine') }}
        </p>

        <div class="mt-auto flex items-baseline justify-between gap-2.5 border-t border-(--color-line) pt-3">
          <span class="font-mono text-[0.85rem]">{{ lot.rent === null ? '—' : money(lot.rent, { cents: false }) }}</span>
          <span class="eyebrow text-[0.6rem] normal-case">
            {{ lot.hasLease && lot.leaseStart ? `${t('biens.since')} ${fullDate(lot.leaseStart)}` : t('biens.noLease') }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>
