<script setup lang="ts">
// Thème et langue posés sur <html> au rendu SERVEUR depuis les cookies, pour
// qu'aucune page ne parte en français/sombre avant de basculer après
// hydratation. 'system' retire l'attribut plutôt que d'en poser un : c'est
// l'absence de data-theme qui rend la main à prefers-color-scheme.
//
// `lang` est géré ici et NON dans nuxt.config.ts : une valeur statique y
// gagnait sur celle-ci, et la page restait annoncée en français même servie
// en anglais.
const { locale } = useLocale()
const { theme } = useTheme()

useHead({
  htmlAttrs: computed(() => ({
    lang: locale.value,
    ...(theme.value === 'system' ? {} : { 'data-theme': theme.value }),
  })),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
