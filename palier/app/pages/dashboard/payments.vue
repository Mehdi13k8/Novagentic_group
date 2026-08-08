<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { data } = await useFetch('/api/payments')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="eyebrow">Payments</p>
      <h1 class="display mt-1 text-3xl">Rent &amp; apartment costs</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">
        Everything synced from Rentila — rent payments and property expenses (ENGIE,
        syndic, taxes...). For the income-vs-costs summary, see
        <NuxtLink to="/dashboard/accounting" class="underline">Accounting</NuxtLink>.
      </p>
    </div>

    <p v-if="!data?.items?.length" class="text-sm text-(--color-fg-soft)">
      Nothing synced yet — connect Rentila from
      <NuxtLink to="/dashboard/integrations" class="underline">Integrations</NuxtLink>
      first.
    </p>

    <div v-else class="overflow-x-auto rounded-lg border border-(--color-line)">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-(--color-line) text-(--color-fg-soft)">
          <tr>
            <th class="px-4 py-3 font-normal">Due</th>
            <th class="px-4 py-3 font-normal">Type</th>
            <th class="px-4 py-3 font-normal">Property</th>
            <th class="px-4 py-3 font-normal">Tenant / payee</th>
            <th class="px-4 py-3 font-normal">Amount</th>
            <th class="px-4 py-3 font-normal">Status</th>
            <th class="px-4 py-3 font-normal">Matched</th>
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
                {{ p.kind === 'rent' ? 'Rent' : 'Expense' }}
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
                {{ p.status }}
              </span>
            </td>
            <td class="px-4 py-3">{{ p.kind === 'rent' ? (p.matched ? 'Yes' : 'No') : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
