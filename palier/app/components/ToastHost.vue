<script setup lang="ts">
import type { ToastTone } from '~/composables/useToasts'

const { toasts, dismiss } = useToasts()
const { t } = useLocale()

const dotClass: Record<ToastTone, string> = {
  ok: 'bg-(--color-ok)',
  signal: 'bg-(--color-signal)',
  danger: 'bg-(--color-danger)',
  cobalt: 'bg-(--color-cobalt)',
}

async function run(id: number, action?: () => void | Promise<void>) {
  dismiss(id)
  await action?.()
}
</script>

<template>
  <div
    class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6"
    aria-live="polite"
    role="status"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-in pointer-events-auto flex max-w-[min(22rem,calc(100vw-2rem))] items-center gap-3 rounded-lg border border-(--color-line) bg-(--color-bg-raised) py-3 pr-3 pl-4 shadow-lg shadow-black/20"
    >
      <span class="size-2 shrink-0 rounded-full" :class="dotClass[toast.tone]" />
      <span class="text-sm leading-snug">{{ toast.text }}</span>
      <button
        v-if="toast.action"
        type="button"
        class="eyebrow shrink-0 text-[0.62rem] text-(--color-cobalt) underline underline-offset-2"
        @click="run(toast.id, toast.action)"
      >
        {{ toast.actionLabel }}
      </button>
      <button
        type="button"
        class="shrink-0 pl-1 text-(--color-fg-soft) transition-colors hover:text-(--color-fg)"
        :aria-label="t('toast.close')"
        @click="dismiss(toast.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>
