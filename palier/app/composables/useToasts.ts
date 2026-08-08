/**
 * Feedback après action — chaque geste du tableau de bord répond quelque
 * chose, et les gestes réversibles proposent « Annuler » dans le toast plutôt
 * que d'ouvrir une confirmation avant coup.
 */
export type ToastTone = 'ok' | 'signal' | 'danger' | 'cobalt'

export interface Toast {
  id: number
  text: string
  tone: ToastTone
  actionLabel?: string
  action?: () => void | Promise<void>
}

const DISMISS_AFTER_MS = 5000

let nextId = 0

export function useToasts() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(text: string, options: { tone?: ToastTone; actionLabel?: string; action?: Toast['action'] } = {}) {
    const id = ++nextId
    toasts.value = [...toasts.value, { id, text, tone: options.tone ?? 'ok', actionLabel: options.actionLabel, action: options.action }]
    // Un toast porteur d'une action reste plus longtemps : « Annuler » qui
    // disparaît avant d'être lisible ne sert à rien.
    if (import.meta.client) {
      setTimeout(() => dismiss(id), options.action ? DISMISS_AFTER_MS * 1.6 : DISMISS_AFTER_MS)
    }
    return id
  }

  return { toasts, push, dismiss }
}
