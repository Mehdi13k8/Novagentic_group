<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { locale, t } = useLocale()
const { data } = await useFetch('/api/payments')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'fr-FR')
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">{{ t('nav.payments') }}</p>
      <h1 class="display mt-1 text-3xl">{{ t('pay.title') }}</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        {{ t('pay.lede') }}
        <NuxtLink to="/dashboard/accounting" class="underline">{{ t('nav.accounting') }}</NuxtLink>.
      </p>
    </div>

    <p v-if="!data?.items?.length" class="text-sm text-(--color-fg-soft)">
      {{ t('pay.empty') }}
      <NuxtLink to="/dashboard/integrations" class="underline">{{ t('nav.integrations') }}</NuxtLink>.
    </p>

    <div v-else class="overflow-x-auto rounded-lg border border-(--color-line)">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-(--color-line) text-(--color-fg-soft)">
          <tr>
            <th class="px-4 py-3 font-normal">{{ t('pay.col.due') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.type') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.property') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.tenant') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.amount') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.status') }}</th>
            <th class="px-4 py-3 font-normal">{{ t('dash.col.matched') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in data.items" :key="p.id" class="border-b border-(--color-line) last:border-0">
            <td class="px-4 py-3">{{ formatDate(p.dueDate) }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded px-1.5 py-0.5 text-xs"
                :class="p.kind === 'rent' ? 'bg-(--color-cobalt)/20 text-(--color-cobalt)' : 'bg-(--color-danger-text)/20 text-(--color-danger-text)'"
              >
                {{ p.kind === 'rent' ? t('pay.kind.rent') : t('pay.kind.expense') }}
              </span>
            </td>
            <td class="px-4 py-3">{{ p.property ?? '—' }}</td>
            <!-- Expenses have no tenant in Rentila's data — fall back to
                 personLabel (the payee, e.g. "ENGIE") instead of showing "—". -->
            <td class="px-4 py-3">{{ p.tenant ?? p.personLabel ?? '—' }}</td>
            <td class="px-4 py-3">€{{ p.amount.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <span
                :class="{
                  'text-(--color-ok-text)': p.status === 'paid',
                  'text-(--color-signal)': p.status === 'pending' || p.status === 'partial',
                  'text-(--color-danger-text)': p.status === 'lost',
                }"
              >
                {{ t(`pay.status.${p.status}`) }}
              </span>
            </td>
            <td class="px-4 py-3">{{ p.kind === 'rent' ? (p.matched ? t('pay.yes') : t('pay.no')) : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
