<script setup lang="ts">
const { user, clear } = useUserSession()
const route = useRoute()

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/integrations', label: 'Integrations' },
  { to: '/dashboard/payments', label: 'Payments' },
  { to: '/dashboard/virements', label: 'Virements' },
  { to: '/dashboard/accounting', label: 'Accounting' },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-(--color-bg) text-(--color-fg)">
    <header class="border-b border-(--color-line)">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NuxtLink to="/dashboard" class="display text-lg">Palier</NuxtLink>
        <nav class="flex items-center gap-6">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="eyebrow transition-colors hover:text-(--color-fg)"
            :class="route.path === link.to ? 'text-(--color-fg)' : 'text-(--color-fg-soft)'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-4">
          <span class="eyebrow text-(--color-fg-soft)">{{ user?.email }}</span>
          <button class="eyebrow text-(--color-fg-soft) hover:text-(--color-fg)" @click="logout">
            Log out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>
