<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <footer class="border-t border-[color:var(--color-line)] px-6 py-9">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <span class="eyebrow tracking-[0.2em] text-[color:var(--color-fg-soft)]">Novagentic</span>
      <p class="coords">{{ t('footer.rights') }}</p>
      <div class="flex gap-6">
        <a
          href="https://www.linkedin.com/in/mehdi--rhoulam/"
          target="_blank"
          rel="noopener noreferrer"
          class="coords transition-colors hover:text-[color:var(--color-cobalt)]"
        >
          LinkedIn Mehdi ↗
        </a>
        <a
          href="https://www.linkedin.com/in/martin-andr%C3%A9-851963215/"
          target="_blank"
          rel="noopener noreferrer"
          class="coords transition-colors hover:text-[color:var(--color-cobalt)]"
        >
          LinkedIn Martin ↗
        </a>
      </div>
    </div>
  </footer>
</template>
