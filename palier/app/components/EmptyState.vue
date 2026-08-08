<script setup lang="ts">
/**
 * État vide conçu, pas une phrase grise : ce qui manque, pourquoi, et le
 * geste qui débloque. Le premier jour dans Palier ne montre que des états
 * vides — c'est la première impression du produit.
 */
defineProps<{
  eyebrow?: string
  title: string
  body?: string
  cta?: string
  to?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-3.5 rounded-lg border border-dashed border-(--color-line-strong) px-8 py-16 text-center"
  >
    <p v-if="eyebrow" class="eyebrow text-[0.65rem]">{{ eyebrow }}</p>
    <h2 class="display text-xl">{{ title }}</h2>
    <p v-if="body" class="max-w-md text-sm leading-relaxed text-(--color-fg-soft)">{{ body }}</p>
    <NuxtLink
      v-if="cta && to"
      :to="to"
      class="mt-2 rounded-md bg-(--color-cobalt) px-5 py-3 text-sm font-bold text-(--color-on-cobalt) transition-opacity hover:opacity-90"
    >
      {{ cta }}
    </NuxtLink>
  </div>
</template>
