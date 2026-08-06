<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/80 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-3">
        <img src="/favicon.svg" alt="" class="h-6 w-6" aria-hidden="true">
        <span class="eyebrow tracking-[0.2em]">Novagentic</span>
      </NuxtLink>
      <nav class="hidden items-center gap-8 sm:flex">
        <a href="/#fondateurs" class="eyebrow text-[color:var(--color-fg-soft)] transition-colors hover:text-[color:var(--color-cobalt)]">Fondateurs</a>
        <a href="/#experience" class="eyebrow text-[color:var(--color-fg-soft)] transition-colors hover:text-[color:var(--color-cobalt)]">Expérience</a>
        <a href="/#offres" class="eyebrow text-[color:var(--color-fg-soft)] transition-colors hover:text-[color:var(--color-cobalt)]">Ce qu'on construit</a>
        <NuxtLink to="/blog" class="eyebrow text-[color:var(--color-fg-soft)] transition-colors hover:text-[color:var(--color-cobalt)]">Blog</NuxtLink>
        <a
          href="/#contact"
          class="eyebrow rounded-md bg-[color:var(--color-fg)] px-4 py-2 text-[color:var(--color-bg)] transition-opacity hover:opacity-90"
        >
          Parler de votre projet
        </a>
      </nav>
    </div>
  </header>
</template>
