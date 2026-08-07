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
      <h1 class="display mt-1 text-3xl">Rent payments</h1>
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
            <th class="px-4 py-3 font-normal">Property</th>
            <th class="px-4 py-3 font-normal">Tenant</th>
            <th class="px-4 py-3 font-normal">Amount</th>
            <th class="px-4 py-3 font-normal">Status</th>
            <th class="px-4 py-3 font-normal">Matched</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in data.items" :key="p.id" class="border-b border-(--color-line) last:border-0">
            <td class="px-4 py-3">{{ formatDate(p.dueDate) }}</td>
            <td class="px-4 py-3">{{ p.property ?? '—' }}</td>
            <td class="px-4 py-3">{{ p.tenant ?? '—' }}</td>
            <td class="px-4 py-3">€{{ p.amount.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <span
                :class="{
                  'text-green-500': p.status === 'paid',
                  'text-(--color-signal)': p.status === 'pending' || p.status === 'partial',
                  'text-red-500': p.status === 'lost',
                }"
              >
                {{ p.status }}
              </span>
            </td>
            <td class="px-4 py-3">{{ p.matched ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
