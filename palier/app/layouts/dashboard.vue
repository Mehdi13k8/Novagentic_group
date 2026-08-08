<script setup lang="ts">
/**
 * Coque du tableau de bord : barre latérale fixe + en-tête de contexte.
 *
 * Deux écarts assumés par rapport à la maquette :
 *
 * 1. Les entrées de navigation ne sont PAS numérotées. La maquette les
 *    numérote 01–07, mais une navigation n'est pas une séquence : on ne passe
 *    pas par « Banque » pour atteindre « Locataires ». C'est la règle
 *    « structure = information » du handoff §5.6, celle qui a fait retirer la
 *    numérotation des savoir-faire du site vitrine. Elle reste employée là où
 *    l'ordre est réel (les trois étapes de mise en route).
 *
 * 2. Le sélecteur d'entité de la maquette est un libellé, pas un menu : un
 *    compte = une organisation (server/utils/org.ts). Un menu déroulant qui
 *    n'ouvre sur rien serait une promesse creuse.
 */
const { user, clear } = useUserSession()
const route = useRoute()
const { t } = useLocale()
const { relative } = useFormat()

const { data: pending } = await useFetch('/api/dashboard/pending')
const { data: org } = await useFetch('/api/org/me')

const links = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/dashboard/virements', key: 'nav.rappro', badge: true },
  { to: '/dashboard/integrations', key: 'nav.banque' },
  { to: '/dashboard/properties', key: 'nav.biens' },
  { to: '/dashboard/accounting', key: 'nav.livre' },
  { to: '/dashboard/tenants', key: 'nav.locataires' },
  { to: '/dashboard/settings', key: 'nav.reglages' },
]

const screenTitle = computed(() => {
  const link = links.find((l) => l.to === route.path)
  return link ? t(link.key.replace('nav.', 'title.')) : t('title.dashboard')
})

// L'initiale sert d'avatar : il n'y a pas de nom sur le compte (le modèle
// User ne porte qu'un email), donc rien à inventer au-delà.
const initials = computed(() => (user.value?.email ?? '?').slice(0, 2).toUpperCase())

/**
 * « Synchro il y a 12 min ». `lastPolledAt` est posé à chaque appel à la
 * banque, y compris ceux qu'elle rejette — c'est donc le dernier contact
 * réel, pas le dernier succès, et l'étiquette ne prétend pas l'inverse.
 */
const sync = computed(() => {
  if (!org.value?.enablebanking.connected) return { tone: 'neutral', label: t('sync.noBank') }
  const at = org.value.enablebanking.lastPolledAt
  if (!at) return { tone: 'signal', label: t('sync.never') }
  const stale = Date.now() - new Date(at).getTime() > 2 * 60 * 60 * 1000
  return { tone: stale ? 'signal' : 'ok', label: `${t('sync.prefix')} ${relative(at)}` }
})

const syncDotClass = computed(
  () => ({ ok: 'bg-(--color-ok)', signal: 'bg-(--color-signal)', neutral: 'bg-(--color-fg-soft)' })[sync.value.tone],
)

const drawerOpen = ref(false)
watch(() => route.path, () => (drawerOpen.value = false))

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-dvh overflow-hidden bg-(--color-bg) text-(--color-fg)">
    <!-- Voile du tiroir mobile — la barre latérale se superpose au contenu
         sous lg, plutôt que de le comprimer. -->
    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40 bg-black/55 lg:hidden"
      @click="drawerOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-58 flex-col border-r border-(--color-line) bg-(--color-bg) transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center gap-3 border-b border-(--color-line) p-5">
        <BrandMark />
        <div>
          <p class="display text-[17px] leading-none">Palier</p>
          <p class="eyebrow mt-1 text-[0.6rem]">{{ t('brand.by') }}</p>
        </div>
      </div>

      <nav class="flex flex-col gap-0.5 p-3" :aria-label="t('nav.aria')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] transition-colors"
          :class="route.path === link.to
            ? 'bg-(--color-bg-sunken) font-semibold text-(--color-fg)'
            : 'text-(--color-fg-soft) hover:text-(--color-fg)'"
          :aria-current="route.path === link.to ? 'page' : undefined"
        >
          <span class="flex-1">{{ t(link.key) }}</span>
          <span
            v-if="link.badge && pending?.toReconcile"
            class="eyebrow rounded-full border border-(--color-signal-text) px-2 py-px text-[0.62rem] text-(--color-signal-text)"
          >
            {{ pending.toReconcile }}
          </span>
        </NuxtLink>
      </nav>

      <div class="mt-auto flex flex-col gap-3.5 border-t border-(--color-line) p-4">
        <!-- La barre fait 232 px : les deux segments passent à la ligne plutôt
             que de déborder. -->
        <AppearanceControls class="flex-wrap justify-center" />
        <div class="flex items-center gap-2.5">
          <span
            class="eyebrow flex size-8 shrink-0 items-center justify-center rounded-full border border-(--color-line) bg-(--color-bg-sunken) text-[0.62rem] text-(--color-fg)"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <NuxtLink to="/dashboard/settings" class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-semibold">{{ user?.email }}</p>
            <p class="eyebrow truncate text-[0.6rem]">{{ org?.name }}</p>
          </NuxtLink>
          <button
            type="button"
            class="flex size-7.5 shrink-0 items-center justify-center rounded-md border border-(--color-line) text-(--color-fg-soft) transition-colors hover:border-(--color-danger-text) hover:text-(--color-danger-text)"
            :title="t('nav.logout')"
            :aria-label="t('nav.logout')"
            @click="logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-(--color-line) px-4 py-3 sm:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center rounded-md border border-(--color-line) text-(--color-fg-soft) lg:hidden"
            :aria-label="t('nav.menu')"
            :aria-expanded="drawerOpen"
            @click="drawerOpen = true"
          >
            ☰
          </button>
          <h1 class="display truncate text-lg sm:text-[22px]">{{ screenTitle }}</h1>
        </div>

        <div class="flex items-center gap-2.5">
          <span
            class="eyebrow hidden items-center gap-2 rounded-md border border-(--color-line) px-3 py-1.5 text-[0.65rem] sm:flex"
          >
            <span class="size-1.5 rounded-full" :class="syncDotClass" aria-hidden="true" />
            {{ sync.label }}
          </span>
          <span class="eyebrow hidden rounded-md border border-(--color-line) px-3 py-1.5 text-[0.65rem] md:block">
            {{ org?.name }}
          </span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-4 pt-6 pb-12 sm:px-8">
        <slot />
      </main>
    </div>

    <ToastHost />
  </div>
</template>
