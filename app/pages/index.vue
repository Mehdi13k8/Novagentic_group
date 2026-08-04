<template>
  <main class="min-h-screen">
    <SiteHeader />

    <section class="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 class="display shine reveal text-6xl">NOVAGENTIC</h1>
      <p class="eyebrow reveal max-w-md text-[color:var(--color-fg-soft)]" style="transition-delay: 0.1s">
        Ingénierie logicielle & data, pour équipes qui n'ont pas droit à l'erreur.
      </p>
      <p class="coords reveal" style="transition-delay: 0.2s">
        43° 17′ 47″ N, 5° 22′ 11″ E — Marseille
      </p>
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
      <div class="mx-auto max-w-5xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Ce que nous savons construire</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Notre terrain de jeu : l'exigence</h2>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          Avant Novagentic, notre équipe a fait ses armes là où l'erreur n'est pas permise —
          industrie, finance, logistique, banque. Quatre exemples de ce que ça donne une fois
          transposé à vos projets.
        </p>

        <div class="mt-12 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          <article
            class="group reveal grid items-center gap-2 border-l-4 border-transparent py-8 transition-all duration-300 hover:border-[color:var(--color-signal)] hover:pl-6 hover:shadow-[0_0_30px_-10px_var(--color-signal)] sm:grid-cols-[3rem_9rem_1fr_8rem] sm:items-baseline sm:gap-6"
          >
            <span class="coords">01</span>
            <p class="eyebrow text-[color:var(--color-signal)]">Automobile</p>
            <h3 class="display text-2xl transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)] sm:text-3xl">
              Le legacy d'un géant automobile, enfin à niveau.
            </h3>
            <p class="eyebrow text-[color:var(--color-fg-soft)] sm:text-right">Stellantis</p>
          </article>

          <article
            class="group reveal grid items-center gap-2 border-l-4 border-transparent py-8 transition-all duration-300 hover:border-[color:var(--color-signal)] hover:pl-6 hover:shadow-[0_0_30px_-10px_var(--color-signal)] sm:grid-cols-[3rem_9rem_1fr_8rem] sm:items-baseline sm:gap-6"
            style="transition-delay: 0.08s"
          >
            <span class="coords">02</span>
            <p class="eyebrow text-[color:var(--color-signal)]">Finance</p>
            <h3 class="display text-2xl transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)] sm:text-3xl">
              Une comptabilité fragile, transformée en socle fiable.
            </h3>
            <p class="eyebrow text-[color:var(--color-fg-soft)] sm:text-right">Free Pro</p>
          </article>

          <article
            class="group reveal grid items-center gap-2 border-l-4 border-transparent py-8 transition-all duration-300 hover:border-[color:var(--color-signal)] hover:pl-6 hover:shadow-[0_0_30px_-10px_var(--color-signal)] sm:grid-cols-[3rem_9rem_1fr_8rem] sm:items-baseline sm:gap-6"
            style="transition-delay: 0.16s"
          >
            <span class="coords">03</span>
            <p class="eyebrow text-[color:var(--color-signal)]">Logistique</p>
            <h3 class="display text-2xl transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)] sm:text-3xl">
              Une logistique bloquée sur FileMaker, libérée.
            </h3>
            <p class="eyebrow text-[color:var(--color-fg-soft)] sm:text-right">CROSSDOCK</p>
          </article>

          <article
            class="group reveal grid items-center gap-2 border-l-4 border-transparent py-8 transition-all duration-300 hover:border-[color:var(--color-signal)] hover:pl-6 hover:shadow-[0_0_30px_-10px_var(--color-signal)] sm:grid-cols-[3rem_9rem_1fr_8rem] sm:items-baseline sm:gap-6"
            style="transition-delay: 0.24s"
          >
            <span class="coords">04</span>
            <p class="eyebrow text-[color:var(--color-signal)]">Banque</p>
            <h3 class="display text-2xl transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)] sm:text-3xl">
              La data au service des décisions d'un grand groupe bancaire.
            </h3>
            <p class="eyebrow text-[color:var(--color-fg-soft)] sm:text-right">BNP Paribas</p>
          </article>
        </div>
      </div>
    </section>

    <section id="contact" class="border-t border-[color:var(--color-line)] px-6 py-24">
      <div class="mx-auto max-w-3xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Parlons-en</p>
        <h2 class="display reveal mt-3 text-4xl" style="transition-delay: 0.08s">Un projet, une question ?</h2>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          Décrivez-nous votre contexte, on revient vers vous rapidement.
        </p>

        <form class="reveal mt-12 grid gap-6" style="transition-delay: 0.2s" @submit.prevent="submitContact">
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
              class="eyebrow border border-[color:var(--color-fg)] px-6 py-3 transition-colors hover:bg-[color:var(--color-fg)] hover:text-[color:var(--color-bg)] disabled:opacity-50"
            >
              {{ status === 'sending' ? 'Envoi…' : 'Envoyer' }}
            </button>
            <p v-if="status === 'success'" class="coords text-[color:var(--color-cobalt)]">
              Message envoyé, merci !
            </p>
            <p v-if="status === 'error'" class="coords text-[color:var(--color-signal)]">
              {{ errorMessage }}
            </p>
          </div>
        </form>
      </div>
    </section>
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
