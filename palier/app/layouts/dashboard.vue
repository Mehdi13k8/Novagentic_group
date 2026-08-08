<script setup lang="ts">
const { user, clear } = useUserSession()
const route = useRoute()
const { t } = useLocale()

const links = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/dashboard/integrations', key: 'nav.integrations' },
  { to: '/dashboard/payments', key: 'nav.payments' },
  { to: '/dashboard/virements', key: 'nav.virements' },
  { to: '/dashboard/accounting', key: 'nav.accounting' },
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
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <NuxtLink to="/dashboard" class="display text-lg">Palier</NuxtLink>
        <nav class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="eyebrow transition-colors hover:text-(--color-fg)"
            :class="route.path === link.to ? 'text-(--color-fg)' : 'text-(--color-fg-soft)'"
          >
            {{ t(link.key) }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-4">
          <AppearanceControls />
          <span class="eyebrow hidden text-(--color-fg-soft) lg:inline">{{ user?.email }}</span>
          <button class="eyebrow text-(--color-fg-soft) hover:text-(--color-fg)" @click="logout">
            {{ t('nav.logout') }}
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>
