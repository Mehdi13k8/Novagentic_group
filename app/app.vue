<script setup lang="ts">
// Le thème et la langue sont posés sur <html> au rendu SERVEUR, à partir des
// cookies. C'est ce qui évite le flash : sans ça la page part en français et
// en sombre, puis bascule après hydratation, à chaque chargement.
//
// 'system' doit retirer l'attribut, pas en poser un — c'est l'absence de
// data-theme qui rend la main à prefers-color-scheme (voir main.css).
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
  <NuxtPage />
</template>
