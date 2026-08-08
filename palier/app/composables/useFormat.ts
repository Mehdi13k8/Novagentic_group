/**
 * Formatage monnaie / date suivant la langue choisie.
 *
 * Le tableau de bord affiche beaucoup de chiffres alignés : les montants
 * passent par `Intl` avec la locale courante (espace fine insécable et « € »
 * après le nombre en français, « €1,060.00 » en anglais), au lieu du
 * `€${n.toFixed(2)}` qui traînait dans les pages et ignorait la langue.
 */
export function useFormat() {
  const { locale } = useLocale()

  const tag = computed(() => (locale.value === 'en' ? 'en-GB' : 'fr-FR'))

  function money(value: number | null | undefined, options: { signed?: boolean; cents?: boolean } = {}) {
    if (value === null || value === undefined) return '—'
    const cents = options.cents ?? true
    const formatted = new Intl.NumberFormat(tag.value, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    }).format(Math.abs(value))
    if (!options.signed) return value < 0 ? `− ${formatted}` : formatted
    return `${value < 0 ? '−' : '+'} ${formatted}`
  }

  function date(value: string | Date | null | undefined) {
    if (!value) return '—'
    return new Intl.DateTimeFormat(tag.value, { day: '2-digit', month: '2-digit' }).format(new Date(value))
  }

  function fullDate(value: string | Date | null | undefined) {
    if (!value) return '—'
    return new Intl.DateTimeFormat(tag.value, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
  }

  /** '2026-08' → « Août 2026 » / 'August 2026' */
  function monthLabel(value: string | null | undefined) {
    if (!value) return '—'
    const [year, month] = value.split('-').map(Number)
    if (!year || !month) return value
    return new Intl.DateTimeFormat(tag.value, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
  }

  /** '2026-08' → « Août » — pour les étiquettes serrées sous les barres. */
  function shortMonth(value: string | null | undefined) {
    if (!value) return '—'
    const [year, month] = value.split('-').map(Number)
    if (!year || !month) return value
    return new Intl.DateTimeFormat(tag.value, { month: 'short' }).format(new Date(year, month - 1, 1))
  }

  /** « il y a 12 min » — pour l'état de synchronisation en en-tête. */
  function relative(value: string | Date | null | undefined) {
    if (!value) return null
    const diffMs = Date.now() - new Date(value).getTime()
    const minutes = Math.round(diffMs / 60_000)
    const rtf = new Intl.RelativeTimeFormat(tag.value, { numeric: 'auto' })
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
    return rtf.format(-Math.round(hours / 24), 'day')
  }

  return { money, date, fullDate, monthLabel, shortMonth, relative }
}
