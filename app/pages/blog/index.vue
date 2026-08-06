<template>
  <main class="min-h-screen">
    <SiteHeader />

    <section class="border-b border-[color:var(--color-line)] px-6 pt-32 pb-16">
      <div class="mx-auto max-w-3xl">
        <p class="eyebrow reveal text-[color:var(--color-cobalt)]">Journal</p>
        <h1 class="display reveal mt-3 text-5xl" style="transition-delay: 0.08s">Blog</h1>
        <p class="reveal mt-4 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          Ce qu'on note pendant qu'on construit : pipelines data, automatisations,
          et les décisions techniques qu'on aurait prises autrement.
        </p>
      </div>
    </section>

    <section class="px-6 py-16">
      <div class="mx-auto max-w-3xl divide-y divide-[color:var(--color-line)]">
        <p v-if="!posts?.length" class="coords py-8 text-[color:var(--color-fg-soft)]">
          Rien ici pour l'instant. Le premier article arrive bientôt.
        </p>

        <NuxtLink
          v-for="post in posts"
          :key="post.path"
          :to="post.path"
          class="group reveal block py-10 first:pt-0"
        >
          <p class="coords text-[color:var(--color-fg-soft)]">
            {{ formatDate(post.date) }}<span v-if="post.readingTime"> · {{ post.readingTime }}</span>
          </p>
          <h2 class="display mt-3 text-2xl normal-case tracking-tight transition-colors duration-300 group-hover:text-[color:var(--color-cobalt)] sm:text-3xl">
            {{ post.title }}
          </h2>
          <p class="mt-3 max-w-2xl leading-relaxed text-[color:var(--color-fg-soft)]">
            {{ post.description }}
          </p>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
useScrollReveal()

const title = 'Blog — Novagentic'
const description = "Ce qu'on note pendant qu'on construit : pipelines data, automatisations, et les décisions techniques qu'on aurait prises autrement."
const url = 'https://novagentic.fr/blog'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: url },
  ],
})

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all(),
)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>