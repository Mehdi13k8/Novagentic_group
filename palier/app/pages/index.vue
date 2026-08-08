<script setup lang="ts">
// Page produit publique. Remplace l'ancienne page d'état, qui affichait un
// panneau /api/health à tout visiteur : utile en développement, mais ce
// n'était pas une porte d'entrée, et cela exposait publiquement l'état de
// configuration de l'infrastructure. Le diagnostic reste disponible sur
// /api/health directement.
const { t } = useLocale()
const { user } = useUserSession()

const steps = ['s1', 's2', 's3'] as const
const secCells = ['c1', 'c2', 'c3', 'c4'] as const
const limits = ['q1', 'q2', 'q3', 'q4'] as const

useHead({
  title: 'Palier — le rapprochement des loyers, en automatique',
  meta: [
    {
      name: 'description',
      content:
        'Palier relie le compte bancaire du bailleur à ses loyers Rentila et rapproche les virements reçus automatiquement. 3 € par mois, sans engagement.',
    },
    // Cette page est publique et doit être indexable, contrairement au reste
    // de l'application (noindex global dans nuxt.config.ts).
    { name: 'robots', content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://palier.novagentic.fr/' }],
})
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-20 border-b border-(--color-line) bg-(--color-bg)/85 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <NuxtLink to="/" class="flex items-baseline gap-2">
          <span class="display text-lg">Palier</span>
          <span class="eyebrow text-[0.6rem] text-(--color-fg-soft)">{{ t('brand.by') }}</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 lg:flex">
          <a href="#fonctionnement" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">{{ t('nav.how') }}</a>
          <a href="#securite" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">{{ t('nav.security') }}</a>
          <a href="#limites" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">{{ t('nav.limits') }}</a>
          <a href="#tarif" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">{{ t('nav.pricing') }}</a>
        </nav>

        <div class="flex items-center gap-3">
          <AppearanceControls />
          <NuxtLink
            :to="user ? '/dashboard' : '/login'"
            class="eyebrow hidden text-(--color-fg-soft) transition-colors hover:text-(--color-fg) sm:inline-block"
          >
            {{ user ? t('nav.dashboard') : t('nav.login') }}
          </NuxtLink>
          <NuxtLink
            to="/signup"
            class="eyebrow rounded-md bg-(--color-signal) px-4 py-2 text-(--color-on-accent) transition-opacity hover:opacity-90"
          >
            {{ t('nav.cta') }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="mx-auto grid max-w-5xl items-center gap-14 px-6 py-20 lg:grid-cols-2">
        <div class="flex flex-col items-start gap-6">
          <p class="eyebrow text-(--color-cobalt)">{{ t('hero.eyebrow') }}</p>
          <h1 class="display text-5xl sm:text-6xl">
            {{ t('hero.title') }}<span class="text-(--color-cobalt)">.</span>
          </h1>
          <p class="max-w-xl text-lg leading-relaxed text-(--color-fg-soft)">{{ t('hero.lede') }}</p>
          <div class="flex flex-wrap items-center gap-4">
            <NuxtLink
              to="/signup"
              class="eyebrow rounded-md bg-(--color-signal) px-7 py-4 text-(--color-on-accent) transition-opacity hover:opacity-90"
            >
              {{ t('hero.cta') }}
            </NuxtLink>
            <a
              href="#fonctionnement"
              class="eyebrow rounded-md border border-(--color-line-strong) px-7 py-4 transition-colors hover:bg-(--color-bg-raised)"
            >
              {{ t('hero.cta2') }}
            </a>
          </div>
          <p class="eyebrow text-(--color-fg-soft)">{{ t('hero.note') }}</p>
        </div>

        <div>
          <div class="overflow-hidden rounded-xl border border-(--color-line) bg-(--color-bg-raised)">
            <div class="flex items-center justify-between gap-4 border-b border-(--color-line) px-5 py-3.5">
              <p class="eyebrow text-(--color-fg-soft)">{{ t('ledger.title') }}</p>
              <span class="eyebrow rounded-full border border-(--color-ok-text) px-2.5 py-1 text-[0.6rem] text-(--color-ok-text)">
                {{ t('ledger.matched') }}
              </span>
            </div>
            <div class="flex flex-col gap-2.5 p-5">
              <div class="rounded-md border border-(--color-line) border-l-2 border-l-(--color-ok-text) bg-(--color-bg)">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="eyebrow truncate normal-case tracking-normal text-(--color-fg-soft)">VIR SEPA M RHOULAM MEHDI</span>
                  <span class="eyebrow shrink-0 tabular-nums text-(--color-ok-text)">+430,00 €</span>
                </div>
                <div class="flex items-center justify-between gap-4 border-t border-(--color-ok-text)/25 bg-(--color-ok-text)/10 px-4 py-2.5">
                  <span class="eyebrow truncate normal-case tracking-normal text-(--color-ok-text)">{{ t('ledger.r1') }}</span>
                </div>
              </div>

              <div class="rounded-md border border-(--color-line) bg-(--color-bg)">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="eyebrow truncate normal-case tracking-normal text-(--color-fg-soft)">VIR SEPA CPAM 131 MARSEILLE</span>
                  <span class="eyebrow shrink-0 tabular-nums">+12,00 €</span>
                </div>
                <div class="flex items-center justify-between gap-4 border-t border-(--color-line) px-4 py-2.5">
                  <span class="eyebrow truncate normal-case tracking-normal text-(--color-fg-soft)">{{ t('ledger.r2') }}</span>
                  <span class="eyebrow shrink-0 rounded-full border border-(--color-signal-text) px-2 py-0.5 text-[0.6rem] text-(--color-signal-text)">
                    {{ t('ledger.review') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p class="eyebrow mt-3 text-(--color-fg-soft)">{{ t('ledger.caption') }}</p>
        </div>
      </section>

      <!-- Problème -->
      <section class="border-t border-(--color-line) px-6 py-20">
        <div class="mx-auto max-w-5xl">
          <p class="eyebrow text-(--color-cobalt)">{{ t('problem.eyebrow') }}</p>
          <h2 class="display mt-3 text-4xl">{{ t('problem.title') }}</h2>

          <div class="mt-10 grid gap-px overflow-hidden rounded-lg border border-(--color-line) bg-(--color-line) sm:grid-cols-2">
            <article class="flex flex-col gap-4 bg-(--color-bg-raised) p-8">
              <h3 class="display text-xl normal-case tracking-tight">{{ t('problem.without') }}</h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="k in ['w1', 'w2', 'w3', 'w4']" :key="k" class="flex gap-3 leading-relaxed text-(--color-fg-soft)">
                  <span class="eyebrow shrink-0 text-(--color-signal-text)" aria-hidden="true">→</span>
                  {{ t(`problem.${k}`) }}
                </li>
              </ul>
            </article>

            <article class="flex flex-col gap-4 bg-(--color-bg-raised) p-8">
              <h3 class="display text-xl normal-case tracking-tight">{{ t('problem.with') }}</h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="k in ['p1', 'p2', 'p3', 'p4']" :key="k" class="flex gap-3 leading-relaxed text-(--color-fg-soft)">
                  <span class="eyebrow shrink-0 text-(--color-cobalt)" aria-hidden="true">→</span>
                  {{ t(`problem.${k}`) }}
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <!-- Fonctionnement : une vraie séquence, d'où la numérotation -->
      <section id="fonctionnement" class="border-t border-(--color-line) bg-(--color-bg-raised) px-6 py-20">
        <div class="mx-auto max-w-5xl">
          <p class="eyebrow text-(--color-cobalt)">{{ t('how.eyebrow') }}</p>
          <h2 class="display mt-3 text-4xl">{{ t('how.title') }}</h2>
          <p class="mt-4 max-w-2xl leading-relaxed text-(--color-fg-soft)">{{ t('how.lede') }}</p>

          <div class="mt-10 grid gap-px overflow-hidden rounded-lg border border-(--color-line) bg-(--color-line) sm:grid-cols-3">
            <article v-for="s in steps" :key="s" class="flex flex-col gap-3 bg-(--color-bg) p-8">
              <p class="eyebrow text-(--color-cobalt)">{{ t(`how.${s}.n`) }}</p>
              <h3 class="display text-xl normal-case tracking-tight">{{ t(`how.${s}.t`) }}</h3>
              <p class="leading-relaxed text-(--color-fg-soft)">{{ t(`how.${s}.b`) }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Sécurité -->
      <section id="securite" class="border-t border-(--color-line) px-6 py-20">
        <div class="mx-auto max-w-5xl">
          <p class="eyebrow text-(--color-cobalt)">{{ t('sec.eyebrow') }}</p>
          <h2 class="display mt-3 text-4xl">{{ t('sec.title') }}</h2>

          <div class="mt-10 grid gap-px overflow-hidden rounded-lg border border-(--color-line) bg-(--color-line) sm:grid-cols-2">
            <article v-for="c in secCells" :key="c" class="flex flex-col gap-2.5 bg-(--color-bg-raised) p-8">
              <h3 class="display text-lg normal-case tracking-tight">{{ t(`sec.${c}.t`) }}</h3>
              <p class="leading-relaxed text-(--color-fg-soft)">{{ t(`sec.${c}.b`) }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Limites : dit avant le prix, volontairement -->
      <section id="limites" class="border-t border-(--color-line) bg-(--color-bg-raised) px-6 py-20">
        <div class="mx-auto max-w-5xl">
          <p class="eyebrow text-(--color-signal-text)">{{ t('lim.eyebrow') }}</p>
          <h2 class="display mt-3 text-4xl">{{ t('lim.title') }}</h2>
          <p class="mt-4 max-w-2xl leading-relaxed text-(--color-fg-soft)">{{ t('lim.lede') }}</p>

          <div class="mt-10 flex flex-col">
            <div
              v-for="(q, i) in limits"
              :key="q"
              class="border-t border-(--color-line) py-6"
              :class="i === limits.length - 1 && 'border-b'"
            >
              <h3 class="display text-lg normal-case tracking-tight">{{ t(`lim.${q}`) }}</h3>
              <p class="mt-2 max-w-3xl leading-relaxed text-(--color-fg-soft)">{{ t(`lim.a${q.slice(1)}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tarif -->
      <section id="tarif" class="border-t border-(--color-line) px-6 py-20">
        <div class="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p class="eyebrow text-(--color-cobalt)">{{ t('price.eyebrow') }}</p>
            <h2 class="display mt-3 text-4xl">{{ t('price.title') }}</h2>
            <p class="mt-4 max-w-xl leading-relaxed text-(--color-fg-soft)">{{ t('price.lede') }}</p>
          </div>

          <div class="flex flex-col items-start gap-5 rounded-xl border border-(--color-line-strong) bg-(--color-bg-raised) p-9">
            <p class="eyebrow text-(--color-signal-text)">{{ t('price.plan') }}</p>
            <div class="flex items-baseline gap-2">
              <span class="display text-5xl tracking-tight tabular-nums">3 €</span>
              <span class="text-(--color-fg-soft)">{{ t('price.unit') }}</span>
            </div>
            <ul class="flex flex-col gap-2.5">
              <li v-for="k in ['f1', 'f2', 'f3', 'f4']" :key="k" class="flex gap-3 leading-relaxed text-(--color-fg-soft)">
                <span class="eyebrow shrink-0 text-(--color-signal-text)" aria-hidden="true">→</span>
                {{ t(`price.${k}`) }}
              </li>
            </ul>
            <NuxtLink
              to="/signup"
              class="eyebrow rounded-md bg-(--color-signal) px-7 py-4 text-(--color-on-accent) transition-opacity hover:opacity-90"
            >
              {{ t('price.cta') }}
            </NuxtLink>
            <p class="eyebrow text-(--color-fg-soft)">{{ t('price.note') }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-(--color-line) px-6 py-10">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div class="flex items-baseline gap-2">
          <span class="display text-lg">Palier</span>
          <span class="eyebrow text-[0.6rem] text-(--color-fg-soft)">{{ t('brand.by') }}</span>
        </div>
        <p class="eyebrow text-(--color-fg-soft)">{{ t('footer.tagline') }}</p>
        <div class="flex gap-5">
          <NuxtLink to="/legal/terms" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">CGU</NuxtLink>
          <NuxtLink to="/legal/privacy" class="eyebrow text-(--color-fg-soft) transition-colors hover:text-(--color-fg)">Confidentialité</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
