<script setup lang="ts">
/**
 * Pastille d'état.
 *
 * Chaque état porte un glyphe ET un libellé : la couleur seule ne doit jamais
 * être le seul porteur de l'information (contrainte du handoff §4.1). Les
 * couleurs sémantiques passent par les tokens `-text`, validés ≥ 4,5:1 dans
 * les deux thèmes — l'ambre de marque est illisible en petit texte sur fond
 * papier, d'où `signal-text` et non `signal`.
 */
const props = withDefaults(
  defineProps<{ tone: 'ok' | 'signal' | 'danger' | 'neutral' | 'cobalt'; label: string; glyph?: string }>(),
  { glyph: undefined },
)

const toneClass = computed(
  () =>
    ({
      ok: 'text-(--color-ok-text) border-(--color-ok-text)/50',
      signal: 'text-(--color-signal-text) border-(--color-signal-text)/50',
      danger: 'text-(--color-danger-text) border-(--color-danger-text)/50',
      cobalt: 'text-(--color-cobalt) border-(--color-cobalt)/50',
      neutral: 'text-(--color-fg-soft) border-(--color-line-strong)',
    })[props.tone],
)

const defaultGlyph = computed(
  () => props.glyph ?? { ok: '✓', signal: '•', danger: '!', cobalt: '→', neutral: '·' }[props.tone],
)
</script>

<template>
  <span
    class="eyebrow inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] whitespace-nowrap"
    :class="toneClass"
  >
    <span aria-hidden="true">{{ defaultGlyph }}</span>
    {{ label }}
  </span>
</template>
