<script setup lang="ts">
/**
 * Locataires — qui habite où, et où en est le loyer du mois.
 *
 * Écran neuf : conçu en maquette, absent du code. Deux boutons de la maquette
 * ne sont pas repris, et c'est délibéré :
 *
 * - « Relancer » (modal d'email pré-rédigé). Le site vitrine annonce noir sur
 *   blanc « Palier ne relance pas vos locataires » (lim.q2). Poser le bouton
 *   sans l'envoi derrière contredirait la page qui vend le produit.
 * - « Quittance PDF ». Rien ne génère de quittance côté serveur, et l'API
 *   Rentila est en lecture seule : le bouton n'aurait rien à télécharger.
 *
 * Les deux redeviennent légitimes le jour où l'envoi et la génération
 * existent — c'est l'écran qui les attend, pas la conception qui manque.
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useLocale()
const { money, fullDate } = useFormat()

const { data, status } = await useFetch('/api/tenants', { lazy: true })
const loading = computed(() => status.value === 'pending' && !data.value)

const statusPill: Record<string, { tone: 'ok' | 'signal' | 'danger'; key: string }> = {
  collected: { tone: 'ok', key: 'loc.status.collected' },
  pending: { tone: 'signal', key: 'loc.status.pending' },
  late: { tone: 'danger', key: 'loc.status.late' },
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading" aria-busy="true">
      <SkeletonBlock height="20rem" />
    </div>

    <EmptyState
      v-else-if="!data?.items?.length"
      :eyebrow="t('loc.empty.eyebrow')"
      :title="t('loc.empty.title')"
      :body="t('loc.empty.body')"
      :cta="t('loc.empty.cta')"
      to="/dashboard/integrations"
    />

    <template v-else>
      <div class="overflow-x-auto rounded-lg border border-(--color-line) bg-(--color-bg-raised)">
        <table class="w-full min-w-[44rem] text-left">
          <thead>
            <tr class="border-b border-(--color-line)">
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal" colspan="2">{{ t('loc.col.tenant') }}</th>
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal">{{ t('loc.col.lot') }}</th>
              <th class="eyebrow px-5 py-2.5 text-right text-[0.6rem] font-normal">{{ t('loc.col.rent') }}</th>
              <th class="eyebrow px-5 py-2.5 text-[0.6rem] font-normal">{{ t('loc.col.month') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in data.items" :key="tenant.id" class="border-b border-(--color-line) last:border-0">
              <td class="py-3.5 pl-5">
                <span
                  class="eyebrow flex size-8.5 items-center justify-center rounded-full border border-(--color-line) bg-(--color-bg-sunken) text-[0.6rem] text-(--color-fg)"
                  aria-hidden="true"
                >
                  {{ initials(tenant.name) }}
                </span>
              </td>
              <td class="py-3.5 pr-5">
                <p class="text-sm font-semibold">{{ tenant.name }}</p>
                <p class="eyebrow mt-0.5 text-[0.6rem] normal-case">
                  {{ tenant.since ? `${t('biens.since')} ${fullDate(tenant.since)}` : '—' }}
                </p>
              </td>
              <td class="px-5 py-3.5 font-mono text-[0.66rem] text-(--color-fg-soft)">{{ tenant.property ?? '—' }}</td>
              <td class="px-5 py-3.5 text-right font-mono text-[0.72rem]">
                {{ tenant.rent === null ? '—' : money(tenant.rent, { cents: false }) }}
              </td>
              <td class="px-5 py-3.5">
                <StatusPill
                  :tone="statusPill[tenant.status].tone"
                  :label="tenant.status === 'late'
                    ? `${t('loc.status.late')} ${tenant.daysLate} ${t('kpi.daysLate')}`
                    : t(statusPill[tenant.status].key)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="eyebrow text-[0.62rem] normal-case">{{ t('loc.note') }}</p>
    </template>
  </div>
</template>
