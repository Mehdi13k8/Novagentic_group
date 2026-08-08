<script setup lang="ts">
import type { Locale } from '~/i18n/messages'
import type { Theme } from '~/composables/useAppearance'

const { locale, setLocale, t } = useLocale()
const { theme, setTheme } = useTheme()

// Trois choix, pas deux : « Système » est l'état par défaut et doit rester
// atteignable. Un simple interrupteur sombre/clair oblige le visiteur à
// choisir un thème fixe dès le premier clic, et il ne peut plus revenir au
// suivi de sa préférence système.
const themes: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'appearance.dark' },
  { value: 'light', label: 'appearance.light' },
  { value: 'system', label: 'appearance.system' },
]

const locales: Locale[] = ['fr', 'en']
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="flex overflow-hidden rounded-md border border-[color:var(--color-line-strong)]"
      role="group"
      :aria-label="t('appearance.theme')"
    >
      <button
        v-for="option in themes"
        :key="option.value"
        type="button"
        class="eyebrow px-2.5 py-1.5 text-[0.62rem] transition-colors"
        :class="theme === option.value
          ? 'bg-[color:var(--color-fg)] text-[color:var(--color-bg)]'
          : 'text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]'"
        :aria-pressed="theme === option.value"
        @click="setTheme(option.value)"
      >
        {{ t(option.label) }}
      </button>
    </div>

    <div
      class="flex overflow-hidden rounded-md border border-[color:var(--color-line-strong)]"
      role="group"
      :aria-label="t('appearance.lang')"
    >
      <button
        v-for="code in locales"
        :key="code"
        type="button"
        class="eyebrow px-2.5 py-1.5 text-[0.62rem] uppercase transition-colors"
        :class="locale === code
          ? 'bg-[color:var(--color-fg)] text-[color:var(--color-bg)]'
          : 'text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]'"
        :aria-pressed="locale === code"
        @click="setLocale(code)"
      >
        {{ code }}
      </button>
    </div>
  </div>
</template>
