<script setup lang="ts">
/**
 * Squelette de chargement — un bloc à la bonne forme plutôt qu'une phrase
 * « Chargement… » : la page ne saute pas quand les données arrivent.
 * `aria-hidden` parce que la zone qui l'entoure porte déjà `aria-busy`.
 */
withDefaults(defineProps<{ height?: string; delay?: number; rounded?: string }>(), {
  height: '6rem',
  delay: 0,
  rounded: 'rounded-lg',
})
</script>

<template>
  <div
    aria-hidden="true"
    class="shimmer border border-(--color-line)"
    :class="rounded"
    :style="{ height, animationDelay: `${delay}ms` }"
  />
</template>
