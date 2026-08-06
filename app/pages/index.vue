<template>
  <main class="min-h-screen">
    <SiteHeader />

    <section class="flex min-h-screen flex-col items-start justify-center gap-9 px-6 py-32 sm:items-center sm:px-10 sm:text-center">
      <div
        class="reveal eyebrow flex items-center gap-3 rounded-full border border-[color:var(--color-line)] px-4 py-2"
      >
        <span class="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
        Disponibles immédiatement · Tarif direct
      </div>

      <h1 class="display shine reveal max-w-4xl text-5xl sm:text-7xl">
        Pas d'agence-façade<span class="text-[color:var(--color-signal)]">.</span>
      </h1>
      <p class="reveal max-w-2xl text-lg leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.1s">
        Chaque mission est prise en charge directement par les deux fondateurs.
        Ingénierie logicielle &amp; data, pour équipes qui n'ont pas droit à l'erreur.
      </p>

      <div class="reveal flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6" style="transition-delay: 0.18s">
        <a
          href="#contact"
          class="eyebrow rounded-md bg-[color:var(--color-signal)] px-7 py-4 text-[color:var(--color-bg)] transition-opacity hover:opacity-90"
        >
          Décrivez-nous votre contexte →
        </a>
        <p class="coords">Réponse sous 24 h, par un fondateur.</p>
      </div>

      <p class="coords reveal" style="transition-delay: 0.24s">
        43° 17′ 47″ N, 5° 22′ 11″ E — Marseille
      </p>
    </section>

    <div class="border-y border-[color:var(--color-line)] px-6 py-8">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-12 gap-y-4">
        <p class="eyebrow text-[color:var(--color-fg-soft)]">Formés là où l'erreur n'est pas permise</p>
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
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Ce que nous savons construire</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Notre terrain de jeu : l'exigence</h2>

        <div class="mt-12 grid gap-px overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2">
          <article class="reveal flex flex-col gap-3 bg-[color:var(--color-bg-raised)] p-10">
            <p class="coords text-[color:var(--color-signal)]">01</p>
            <h3 class="display text-2xl normal-case tracking-tight">Data, scoring &amp; IA</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">
              Modélisation, scoring et analytics au service de décisions concrètes — affinés au
              contact des enjeux d'un grand groupe bancaire.
            </p>
          </article>

          <article class="reveal flex flex-col gap-3 bg-[color:var(--color-bg-raised)] p-10" style="transition-delay: 0.06s">
            <p class="coords text-[color:var(--color-signal)]">02</p>
            <h3 class="display text-2xl normal-case tracking-tight">Legacy fiabilisé</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">
              Des systèmes vieillissants remis à niveau sans tout casser — comme le legacy d'un
              géant automobile, enfin à niveau.
            </p>
          </article>

          <article class="reveal flex flex-col gap-3 bg-[color:var(--color-bg-raised)] p-10" style="transition-delay: 0.12s">
            <p class="coords text-[color:var(--color-signal)]">03</p>
            <h3 class="display text-2xl normal-case tracking-tight">Migrations sans interruption</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">
              Changer de socle sans arrêter le service : une comptabilité fragile transformée en
              socle fiable, une logistique bloquée sur FileMaker, libérée.
            </p>
          </article>

          <article class="reveal flex flex-col gap-3 bg-[color:var(--color-bg-raised)] p-10" style="transition-delay: 0.18s">
            <p class="coords text-[color:var(--color-signal)]">04</p>
            <h3 class="display text-2xl normal-case tracking-tight">Architectures sous charge</h3>
            <p class="leading-relaxed text-[color:var(--color-fg-soft)]">
              Des architectures qui encaissent la charge, pensées pour les équipes financières et
              industrielles qui ne peuvent pas se permettre de voir tomber leurs systèmes.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="fondateurs" class="border-t border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Derrière Novagentic</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Deux experts, une exigence</h2>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          Pas d'agence-façade : chaque mission est prise en charge directement par les fondateurs,
          formés dans des environnements où l'erreur coûte cher.
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
              <p class="eyebrow mt-1 text-[color:var(--color-cobalt)]">Ingénierie & architecture</p>
              <p class="mt-3 leading-relaxed">
                Construit les systèmes que les équipes financières et industrielles ne peuvent pas
                se permettre de voir tomber : legacy fiabilisé, migrations sans interruption de
                service, architectures qui encaissent la charge.
              </p>
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
              <p class="eyebrow mt-1 text-[color:var(--color-cobalt)]">Data & intelligence</p>
              <p class="mt-3 leading-relaxed">
                Affine son expertise data au contact des enjeux d'un grand groupe bancaire : modélisation, scoring et analytics au service de décisions concrètes.
              </p>
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
          <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Pourquoi nous</p>
          <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">
            Ce que « sans agence-façade » veut dire
          </h2>
        </div>

        <div class="flex flex-col">
          <div class="reveal flex gap-6 border-t border-[color:var(--color-line)] py-6">
            <span class="eyebrow min-w-6 text-[color:var(--color-signal)]">→</span>
            <p class="leading-relaxed">
              <strong class="text-[color:var(--color-fg)]">Vos interlocuteurs font le travail.</strong>
              <span class="text-[color:var(--color-fg-soft)]"> Pas de commercial, pas de sous-traitance : vous parlez à ceux qui codent.</span>
            </p>
          </div>
          <div class="reveal flex gap-6 border-t border-[color:var(--color-line)] py-6" style="transition-delay: 0.06s">
            <span class="eyebrow min-w-6 text-[color:var(--color-signal)]">→</span>
            <p class="leading-relaxed">
              <strong class="text-[color:var(--color-fg)]">Tarif direct.</strong>
              <span class="text-[color:var(--color-fg-soft)]"> Sans intermédiaire ni marge d'agence — l'expertise senior, au prix juste.</span>
            </p>
          </div>
          <div class="reveal flex gap-6 border-t border-[color:var(--color-line)] py-6" style="transition-delay: 0.12s">
            <span class="eyebrow min-w-6 text-[color:var(--color-signal)]">→</span>
            <p class="leading-relaxed">
              <strong class="text-[color:var(--color-fg)]">Disponibles immédiatement.</strong>
              <span class="text-[color:var(--color-fg-soft)]"> Un premier échange cette semaine, un démarrage rapide.</span>
            </p>
          </div>
          <div class="reveal flex gap-6 border-y border-[color:var(--color-line)] py-6" style="transition-delay: 0.18s">
            <span class="eyebrow min-w-6 text-[color:var(--color-signal)]">→</span>
            <p class="leading-relaxed">
              <strong class="text-[color:var(--color-fg)]">L'exigence comme standard.</strong>
              <span class="text-[color:var(--color-fg-soft)]"> Formés dans l'automobile, la banque, la finance et la logistique — là où l'erreur coûte cher.</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="blog" class="border-t border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-5xl">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Blog</p>
            <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Notes de terrain</h2>
          </div>
          <NuxtLink to="/blog" class="eyebrow reveal text-[color:var(--color-cobalt)]" style="transition-delay: 0.08s">
            Tous les articles ↗
          </NuxtLink>
        </div>

        <p v-if="!posts?.length" class="coords reveal mt-12 text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          Rien ici pour l'instant. Le premier article arrive bientôt.
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
            <span class="eyebrow mt-auto text-[color:var(--color-signal)]">Lire →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="contact" class="border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-6 py-24">
      <div class="mx-auto grid max-w-5xl gap-16 sm:grid-cols-[1fr_1.1fr]">
        <div>
          <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Parlons-en</p>
          <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Un projet, une question ?</h2>
          <p class="reveal mt-4 leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
            Décrivez-nous votre contexte — legacy, migration, data, IA. Un fondateur vous répond sous 24 h.
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
              <label for="name" class="eyebrow block text-[color:var(--color-fg-soft)]">Nom *</label>
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
              <label for="email" class="eyebrow block text-[color:var(--color-fg-soft)]">Email *</label>
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
            <label for="company" class="eyebrow block text-[color:var(--color-fg-soft)]">Société</label>
            <input
              id="company"
              v-model="form.company"
              type="text"
              name="company"
              class="mt-2 w-full border-b border-[color:var(--color-line)] bg-transparent py-2 outline-none transition-colors focus:border-[color:var(--color-cobalt)]"
            >
          </div>

          <div>
            <label for="message" class="eyebrow block text-[color:var(--color-fg-soft)]">Message *</label>
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
              class="eyebrow rounded-md bg-[color:var(--color-signal)] px-7 py-4 text-[color:var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {{ status === 'sending' ? 'Envoi…' : 'Envoyer →' }}
            </button>
            <p v-if="status === 'error'" class="coords text-[color:var(--color-signal)]">
              {{ errorMessage }}
            </p>
          </div>
        </form>

        <div v-else class="reveal is-visible flex flex-col items-start gap-4 rounded-lg border border-[color:var(--color-line)] p-14">
          <span class="h-3.5 w-3.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <p class="display text-2xl normal-case tracking-tight">Bien reçu.</p>
          <p class="leading-relaxed text-[color:var(--color-fg-soft)]">Un fondateur revient vers vous sous 24 h.</p>
          <button
            type="button"
            class="eyebrow text-[color:var(--color-signal)]"
            @click="status = 'idle'"
          >
            ← Envoyer un autre message
          </button>
        </div>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
useScrollReveal()

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
const errorMessage = ref('')

const { data: posts } = await useAsyncData('home-blog-preview', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all(),
)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function submitContact() {
  status.value = 'sending'
  errorMessage.value = ''

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
    errorMessage.value = "Une erreur est survenue, réessayez ou écrivez-nous directement sur LinkedIn."
  }
}
</script>
