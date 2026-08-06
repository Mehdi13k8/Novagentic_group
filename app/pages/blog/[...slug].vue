<template>
  <main class="min-h-screen">
    <SiteHeader />

    <article v-if="page" class="px-6 pt-32 pb-24">
      <header class="mx-auto max-w-3xl">
        <NuxtLink to="/blog" class="eyebrow text-[color:var(--color-fg-soft)] transition-colors hover:text-[color:var(--color-cobalt)]">← Blog</NuxtLink>
        <p class="coords reveal mt-6 text-[color:var(--color-fg-soft)]">
          {{ formatDate(page.date) }}<span v-if="page.readingTime"> — {{ page.readingTime }}</span>
        </p>
        <h1 class="display reveal mt-3 text-4xl normal-case tracking-tight sm:text-5xl" style="transition-delay: 0.08s">
          {{ page.title }}
        </h1>
        <p class="reveal mt-4 leading-relaxed text-[color:var(--color-fg-soft)]" style="transition-delay: 0.16s">
          {{ page.description }}
        </p>
      </header>

      <img
        v-if="page.image"
        :src="page.image"
        :alt="page.imageAlt || ''"
        class="reveal mx-auto mt-12 max-w-3xl rounded-lg border border-[color:var(--color-line)]"
        style="transition-delay: 0.2s"
      >

      <div class="reveal mt-12" style="transition-delay: 0.24s">
        <ContentRenderer :value="page" class="blog-prose" />
      </div>

      <footer class="mx-auto mt-20 max-w-3xl border-t border-[color:var(--color-line)] pt-10">
        <p class="eyebrow text-[color:var(--color-cobalt)]">Un projet du même genre ?</p>
        <a
          href="/#contact"
          class="eyebrow mt-3 inline-block border border-[color:var(--color-fg)] px-6 py-3 transition-colors hover:bg-[color:var(--color-fg)] hover:text-[color:var(--color-bg)]"
        >
          Parlons-en
        </a>
      </footer>
    </article>

    <div v-else class="px-6 pt-32 pb-24 text-center">
      <p class="coords text-[color:var(--color-fg-soft)]">Article introuvable.</p>
      <NuxtLink to="/blog" class="eyebrow mt-4 inline-block text-[color:var(--color-cobalt)] underline underline-offset-4">
        Retour au blog
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
useScrollReveal()

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
}

const siteUrl = 'https://novagentic.fr'
const canonicalUrl = `${siteUrl}${route.path}`
const ogImage = computed(() =>
  page.value?.image ? `${siteUrl}${page.value.image}` : `${siteUrl}/og-image.png`,
)

useHead({
  title: () => `${page.value?.title} — Novagentic`,
  meta: [
    { name: 'description', content: () => page.value?.description },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:title', content: () => page.value?.title },
    { property: 'og:description', content: () => page.value?.description },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: () => page.value?.imageAlt || page.value?.title },
    { property: 'article:published_time', content: () => page.value?.date },
    { name: 'twitter:title', content: () => page.value?.title },
    { name: 'twitter:description', content: () => page.value?.description },
    { name: 'twitter:image', content: ogImage },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': page.value?.title,
        'description': page.value?.description,
        'image': ogImage.value,
        'datePublished': page.value?.date,
        'author': {
          '@type': 'Organization',
          'name': 'Novagentic',
          'url': siteUrl,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Novagentic',
          'logo': {
            '@type': 'ImageObject',
            'url': `${siteUrl}/icon-512.png`,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      }),
    },
  ],
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
