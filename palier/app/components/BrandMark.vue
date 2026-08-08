<script setup lang="ts">
/**
 * Le monogramme Palier : deux angles de cadre et un point ambre au centre —
 * « ce qui est attendu, ce qui est arrivé, et le rapprochement au milieu ».
 * Les traits suivent la couleur du texte, le point garde l'ambre de marque
 * (c'est un aplat, pas du texte : la contrainte de contraste ne s'applique
 * pas de la même façon).
 */
withDefaults(defineProps<{ size?: number }>(), { size: 22 })
</script>

<template>
  <div class="relative shrink-0" :style="{ height: `${size}px`, width: `${size}px` }" aria-hidden="true">
    <div class="absolute top-0 left-0 size-[7px] border-t-2 border-l-2 border-(--color-fg)" />
    <div class="absolute right-0 bottom-0 size-[7px] border-r-2 border-b-2 border-(--color-fg)" />
    <div class="absolute top-1/2 left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--color-signal)" />
  </div>
</template>
