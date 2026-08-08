<template>
  <main class="min-h-screen">
    <SiteHeader />

    <section class="flex min-h-screen flex-col items-start justify-center gap-9 px-6 py-32 sm:items-center sm:px-10 sm:text-center">
      <div
        class="reveal eyebrow flex items-center gap-3 rounded-full border border-[color:var(--color-line)] px-4 py-2"
      >
        <span class="h-2 w-2 rounded-full bg-[color:var(--color-ok)]" aria-hidden="true" />
        {{ t('hero.status') }}
      </div>

      <h1 class="display shine reveal max-w-4xl text-5xl sm:text-7xl">
        {{ t('hero.title') }}<span class="text-[color:var(--color-signal-text)]">.</span>
      </h1>
      <p class="reveal max-w-2xl text-lg leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.1s">
        {{ t('hero.lede') }}
      </p>

      <div class="reveal flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6" style="transition-delay: 0.18s">
        <a
          href="#contact"
          class="eyebrow rounded-md bg-[color:var(--color-signal)] px-7 py-4 text-[color:var(--color-on-accent)] transition-opacity hover:opacity-90"
        >
          {{ t('hero.cta') }}
        </a>
        <a
          href="#produits"
          class="eyebrow rounded-md border border-[color:var(--color-line-strong)] px-7 py-4 transition-colors hover:bg-[color:var(--color-bg-raised)]"
        >
          {{ t('hero.cta2') }}
        </a>
        <p class="coords">{{ t('hero.reply') }}</p>
      </div>

      <p class="coords reveal" style="transition-delay: 0.24s">
        43° 17′ 47″ N, 5° 22′ 11″ E — Marseille
      </p>
    </section>

    <div class="border-y border-[color:var(--color-line)] px-6 py-8">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-12 gap-y-4">
        <!-- Entreprises où les fondateurs se sont FORMÉS, pas des clients. -->
        <p class="eyebrow text-[color:var(--color-fg-soft)]">{{ t('provenance.label') }}</p>
        <div class="flex flex-wrap gap-x-10 gap-y-2">
          <span class="display text-lg normal-case tracking-normal text-[color:var(--color-fg-soft)]">Stellantis</span>
          <span class="display text-lg normal-case tracking-normal text-[color:var(--color-fg-soft)]">BNP Paribas</span>
          <span class="display text-lg normal-case tracking-normal text-[color:var(--color-fg-soft)]">Free Pro</span>
          <span class="display text-lg normal-case tracking-normal text-[color:var(--color-fg-soft)]">Crossdock</span>
        </div>
      </div>
    </div>

    <section id="offres" class="border-b border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('offres.eyebrow') }}</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">{{ t('offres.title') }}</h2>

        <!--
          Étiquette de domaine, pas de numérotation : ces quatre savoir-faire
          ne forment pas une séquence, et un 01/02/03/04 affirmait un ordre
          qui n'existe pas. Le domaine, lui, est une information vraie.
        -->
        <div class="mt-12 grid gap-px overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2">
          <article
            v-for="(card, i) in offres"
            :key="card.key"
            class="reveal flex flex-col gap-3 bg-[color:var(--color-bg-raised)] p-10"
            :style="{ transitionDelay: `${i * 0.06}s` }"
          >
            <p class="coords text-[color:var(--color-cobalt)]">{{ t(`offres.${card.key}.tag`) }}</p>
            <h3 class="display text-2xl normal-case tracking-tight">{{ t(`offres.${card.key}.title`) }}</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">{{ t(`offres.${card.key}.body`) }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="produits" class="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('produits.eyebrow') }}</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">{{ t('produits.title') }}</h2>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          {{ t('produits.lede') }}
        </p>

        <div class="mt-12 grid items-center gap-12 lg:grid-cols-2">
          <div class="reveal flex flex-col items-start gap-5">
            <p class="eyebrow text-[color:var(--color-signal-text)]">{{ t('produits.palier.eyebrow') }}</p>
            <h3 class="display text-3xl normal-case tracking-tight">{{ t('produits.palier.title') }}</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">{{ t('produits.palier.body') }}</p>

            <ul class="flex flex-col gap-2.5">
              <li
                v-for="b in ['b1', 'b2', 'b3']"
                :key="b"
                class="flex gap-3 leading-relaxed text-[color:var(--color-fg-soft)]"
              >
                <span class="coords shrink-0 text-[color:var(--color-signal-text)]" aria-hidden="true">→</span>
                {{ t(`produits.palier.${b}`) }}
              </li>
            </ul>

            <div class="flex items-baseline gap-2">
              <span class="display text-4xl tracking-tight tabular-nums">3 €</span>
              <span class="text-sm text-[color:var(--color-fg-soft)]">{{ t('produits.palier.unit') }}</span>
            </div>

            <a
              href="https://palier.novagentic.fr"
              class="eyebrow rounded-md bg-[color:var(--color-signal)] px-7 py-4 text-[color:var(--color-on-accent)] transition-opacity hover:opacity-90"
            >
              {{ t('produits.palier.cta') }}
            </a>
          </div>

          <div
            class="reveal overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg)]"
            style="transition-delay: 0.1s"
            role="img"
            :aria-label="t('produits.palier.alt')"
          >
            <div class="flex items-center justify-between gap-4 border-b border-[color:var(--color-line)] px-5 py-3.5">
              <p class="eyebrow text-[color:var(--color-fg-soft)]">{{ t('produits.palier.ledger') }}</p>
              <span class="coords rounded-full border border-[color:var(--color-ok-text)] px-2.5 py-1 text-[0.62rem] text-[color:var(--color-ok-text)]">
                {{ t('produits.palier.matched') }}
              </span>
            </div>
            <div class="flex flex-col gap-2.5 p-5">
              <div class="flex items-center justify-between gap-4 rounded-md border border-[color:var(--color-ok-text)] bg-[color:var(--color-bg-raised)] px-4 py-3.5">
                <span class="coords truncate">VIR SEPA M RHOULAM MEHDI</span>
                <span class="coords shrink-0 tabular-nums text-[color:var(--color-ok-text)]">+430,00 €</span>
              </div>
              <p class="coords px-4">{{ t('produits.palier.r1') }}</p>
              <div class="flex items-center justify-between gap-4 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-4 py-3.5">
                <span class="coords truncate">VIR SEPA CPAM 131 MARSEILLE</span>
                <span class="coords shrink-0 tabular-nums">+12,00 €</span>
              </div>
              <p class="coords px-4">{{ t('produits.palier.r2') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="fondateurs" class="border-t border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('fondateurs.eyebrow') }}</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">{{ t('fondateurs.title') }}</h2>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          {{ t('fondateurs.lede') }}
        </p>

        <div class="mt-12 grid gap-10 sm:grid-cols-2">
          <article class="reveal flex gap-5">
            <img
              src="~/assets/img/mehdi_image.png"
              alt="Mehdi Rhoulam"
              class="h-20 w-20 shrink-0 rounded-full border border-[color:var(--color-line)] object-cover"
            >
            <div>
              <h3 class="display text-2xl">Mehdi Rhoulam</h3>
              <p class="eyebrow mt-1 text-[color:var(--color-cobalt)]">{{ t('fondateurs.mehdi.role') }}</p>
              <p class="mt-3 leading-relaxed">{{ t('fondateurs.mehdi.bio') }}</p>
              <a
                href="https://www.linkedin.com/in/mehdi--rhoulam/"
                target="_blank"
                rel="noopener noreferrer"
                class="eyebrow mt-4 inline-block text-[color:var(--color-cobalt)] underline underline-offset-4"
              >
                LinkedIn ↗
              </a>
            </div>
          </article>

          <article class="reveal flex gap-5" style="transition-delay: 0.1s">
            <img
              src="~/assets/img/martin_image.png"
              alt="Martin André"
              class="h-20 w-20 shrink-0 rounded-full border border-[color:var(--color-line)] object-cover"
            >
            <div>
              <h3 class="display text-2xl">Martin André</h3>
              <p class="eyebrow mt-1 text-[color:var(--color-cobalt)]">{{ t('fondateurs.martin.role') }}</p>
              <p class="mt-3 leading-relaxed">{{ t('fondateurs.martin.bio') }}</p>
              <a
                href="https://www.linkedin.com/in/martin-andr%C3%A9-851963215/"
                target="_blank"
                rel="noopener noreferrer"
                class="eyebrow mt-4 inline-block text-[color:var(--color-cobalt)] underline underline-offset-4"
              >
                LinkedIn ↗
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="experience" class="border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-6 py-24">
      <div class="mx-auto grid max-w-5xl gap-16 sm:grid-cols-2">
        <div>
          <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('why.eyebrow') }}</p>
          <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">
            {{ t('why.title') }}
          </h2>
        </div>

        <div class="flex flex-col">
          <div
            v-for="(row, i) in ['r1', 'r2', 'r3', 'r4']"
            :key="row"
            class="reveal flex gap-6 border-t border-[color:var(--color-line)] py-6"
            :class="i === 3 && 'border-b'"
            :style="{ transitionDelay: `${i * 0.06}s` }"
          >
            <span class="eyebrow min-w-6 text-[color:var(--color-signal-text)]" aria-hidden="true">→</span>
            <p class="leading-relaxed">
              <strong class="text-[color:var(--color-fg)]">{{ t(`why.${row}.t`) }}</strong>
              <span class="text-[color:var(--color-fg-soft)]"> {{ t(`why.${row}.b`) }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="blog" class="border-t border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('blog.eyebrow') }}</p>
            <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">{{ t('blog.title') }}</h2>
          </div>
          <NuxtLink to="/blog" class="eyebrow reveal text-[color:var(--color-cobalt)]" style="transition-delay: 0.08s">
            {{ t('blog.all') }}
          </NuxtLink>
        </div>

        <p v-if="!posts?.length" class="coords reveal mt-12 text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          {{ t('blog.empty') }}
        </p>

        <div v-else class="mt-12 grid gap-px overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-3">
          <NuxtLink
            v-for="(post, i) in posts"
            :key="post.path"
            :to="post.path"
            class="group reveal flex flex-col gap-4 bg-[color:var(--color-bg-raised)] p-9"
            :style="{ transitionDelay: `${i * 0.06}s` }"
          >
            <p class="coords text-[color:var(--color-fg-soft)]">
              {{ formatDate(post.date) }}<span v-if="post.readingTime"> · {{ post.readingTime }}</span>
            </p>
            <h3 class="display text-xl normal-case tracking-tight transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)]">
              {{ post.title }}
            </h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">{{ post.description }}</p>
            <span class="eyebrow mt-auto text-[color:var(--color-signal-text)]">{{ t('blog.read') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="contact" class="border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-6 py-24">
      <div class="mx-auto grid max-w-5xl gap-16 sm:grid-cols-[1fr_1.1fr]">
        <div>
          <p class="eyebrow reveal text-[color:var(--color-cobalt)]">{{ t('contact.eyebrow') }}</p>
          <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">{{ t('contact.title') }}</h2>
          <p class="reveal mt-4 leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
            {{ t('contact.lede') }}
          </p>
          <p class="coords reveal mt-6" style="transition-delay: 0.22s">
            43° 17′ 47″ N, 5° 22′ 11″ E — Marseille
          </p>
        </div>

        <form
          v-if="status !== 'success'"
          class="reveal grid gap-6"
          style="transition-delay: 0.2s"
          @submit.prevent="submitContact"
        >
          <!-- honeypot, hidden from real users -->
          <div class="hidden" aria-hidden="true">
            <label for="website">Website</label>
            <input id="website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="name" class="eyebrow block text-[color:var(--color-fg-soft)]">{{ t('contact.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                name="name"
                required
                class="mt-2 w-full border-b border-[color:var(--color-line)] bg-transparent py-2 outline-none transition-colors focus:border-[color:var(--color-cobalt)]"
              >
            </div>
            <div>
              <label for="email" class="eyebrow block text-[color:var(--color-fg-soft)]">{{ t('contact.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                name="email"
                required
                class="mt-2 w-full border-b border-[color:var(--color-line)] bg-transparent py-2 outline-none transition-colors focus:border-[color:var(--color-cobalt)]"
              >
            </div>
          </div>

          <div>
            <label for="company" class="eyebrow block text-[color:var(--color-fg-soft)]">{{ t('contact.company') }}</label>
            <input
              id="company"
              v-model="form.company"
              type="text"
              name="company"
              class="mt-2 w-full border-b border-[color:var(--color-line)] bg-transparent py-2 outline-none transition-colors focus:border-[color:var(--color-cobalt)]"
            >
          </div>

          <div>
            <label for="message" class="eyebrow block text-[color:var(--color-fg-soft)]">{{ t('contact.message') }}</label>
            <textarea
              id="message"
              v-model="form.message"
              name="message"
              rows="5"
              required
              class="mt-2 w-full resize-none border-b border-[color:var(--color-line)] bg-transparent py-2 leading-relaxed outline-none transition-colors focus:border-[color:var(--color-cobalt)]"
            />
          </div>

          <div class="flex items-center gap-4">
            <button
              type="submit"
              :disabled="status === 'sending'"
              class="eyebrow rounded-md bg-[color:var(--color-signal)] px-7 py-4 text-[color:var(--color-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {{ status === 'sending' ? t('contact.sending') : t('contact.send') }}
            </button>
            <p v-if="status === 'error'" class="coords text-[color:var(--color-danger-text)]">
              {{ t('contact.error') }}
            </p>
          </div>
        </form>

        <div v-else class="reveal is-visible flex flex-col items-start gap-4 rounded-lg border border-[color:var(--color-line)] p-14">
          <span class="h-3.5 w-3.5 rounded-full bg-[color:var(--color-ok)]" aria-hidden="true" />
          <p class="display text-2xl normal-case tracking-tight">{{ t('contact.okTitle') }}</p>
          <p class="leading-relaxed text-[color:var(--color-fg-soft)]">{{ t('contact.okBody') }}</p>
          <button
            type="button"
            class="eyebrow text-[color:var(--color-signal-text)]"
            @click="status = 'idle'"
          >
            {{ t('contact.again') }}
          </button>
        </div>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
useScrollReveal()

const { locale, t } = useLocale()

const offres = [{ key: 'c1' }, { key: 'c2' }, { key: 'c3' }, { key: 'c4' }] as const

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        'name': 'Novagentic',
        'url': 'https://novagentic.fr/',
        'logo': 'https://novagentic.fr/icon-512.png',
        'image': 'https://novagentic.fr/og-image.png',
        'description': 'Ingénierie logicielle & data, pour équipes qui n\'ont pas droit à l\'erreur.',
        'email': 'contact@novagentic.fr',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Marseille',
          'addressCountry': 'FR',
        },
        'areaServed': 'FR',
        'sameAs': [
          'https://www.linkedin.com/in/mehdi--rhoulam/',
          'https://www.linkedin.com/in/martin-andr%C3%A9-851963215/',
        ],
        'founder': [
          {
            '@type': 'Person',
            'name': 'Mehdi Rhoulam',
            'jobTitle': 'Ingénierie & architecture',
            'sameAs': 'https://www.linkedin.com/in/mehdi--rhoulam/',
          },
          {
            '@type': 'Person',
            'name': 'Martin André',
            'jobTitle': 'Data & intelligence',
            'sameAs': 'https://www.linkedin.com/in/martin-andr%C3%A9-851963215/',
          },
        ],
        // Palier est désormais présenté sur la page : le déclarer ici évite
        // que le produit existe pour un visiteur mais pas pour un moteur.
        'makesOffer': {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'SoftwareApplication',
            'name': 'Palier',
            'applicationCategory': 'FinanceApplication',
            'url': 'https://palier.novagentic.fr',
          },
          'price': '3',
          'priceCurrency': 'EUR',
        },
      }),
    },
  ],
})

const form = reactive({
  name: '',
  email: '',
  company: '',
  message: '',
  website: '', // honeypot
})

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

const { data: posts } = await useAsyncData('home-blog-preview', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all(),
)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function submitContact() {
  status.value = 'sending'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })
    status.value = 'success'
    form.name = ''
    form.email = ''
    form.company = ''
    form.message = ''
  }
  catch {
    status.value = 'error'
  }
}
</script>
