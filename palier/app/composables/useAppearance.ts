/**
 * Langue et thème, sans dépendance externe.
 *
 * Volontairement PAS @nuxtjs/i18n : ce module apporte surtout des URL par
 * langue (/en/…), ce qui change le routage du site déjà en ligne et la
 * configuration du proxy. Pour deux langues et trois pages publiques, un
 * dictionnaire suffit. Si le référencement de la version anglaise devient
 * un objectif, c'est là qu'il faudra basculer — les clés ci-dessous se
 * reprennent telles quelles.
 *
 * Les deux préférences sont stockées en cookie, pas en localStorage : le
 * rendu se fait côté serveur, et un cookie est le seul des deux que le
 * serveur peut lire pour produire directement la bonne version. Avec
 * localStorage, la page arriverait en français/sombre puis basculerait
 * après hydratation — un flash visible à chaque chargement.
 */
import { messages, type Locale } from '~/i18n/messages'

export type Theme = 'dark' | 'light' | 'system'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Les deux applications sont sur deux hôtes (novagentic.fr et
 * palier.novagentic.fr). Un cookie sans domaine explicite est lié à SON
 * hôte : choisir l'anglais sur le site vitrine puis cliquer « Découvrir
 * Palier » ramènerait au français. On élargit donc le cookie au domaine
 * parent en production, pour que la préférence suive le visiteur d'un
 * produit à l'autre.
 *
 * En local (localhost, IP, *.local) on ne pose AUCUN domaine : un cookie
 * portant un domaine que l'hôte courant ne satisfait pas est rejeté par le
 * navigateur, et la préférence cesserait d'être mémorisée en développement.
 */
function cookieDomain(): string | undefined {
  const host = import.meta.client
    ? window.location.hostname
    : (useRequestHeaders(['host']).host ?? '').split(':')[0]
  return host && host.endsWith('novagentic.fr') ? '.novagentic.fr' : undefined
}


export function useLocale() {
  const cookie = useCookie<Locale>('novagentic_locale', {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    domain: cookieDomain(),
    default: () => 'fr',
  })

  const locale = useState<Locale>('locale', () => cookie.value ?? 'fr')

  function setLocale(next: Locale) {
    locale.value = next
    cookie.value = next
  }

  /**
   * Renvoie la clé elle-même si la traduction manque, plutôt qu'une chaîne
   * vide : un libellé absent doit se voir en revue, pas disparaître de
   * l'interface.
   */
  function t(key: string): string {
    return messages[locale.value]?.[key] ?? messages.fr[key] ?? key
  }

  return { locale, setLocale, t }
}

export function useTheme() {
  const cookie = useCookie<Theme>('novagentic_theme', {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    domain: cookieDomain(),
    default: () => 'system',
  })

  const theme = useState<Theme>('theme', () => cookie.value ?? 'system')

  function setTheme(next: Theme) {
    theme.value = next
    cookie.value = next
    if (import.meta.client) applyTheme(next)
  }

  function applyTheme(next: Theme) {
    const root = document.documentElement
    // 'system' retire le marquage au lieu d'en poser un : c'est ce qui rend
    // la main à prefers-color-scheme. Poser data-theme="dark" pour
    // « système » figerait la page sur le thème du moment.
    if (next === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', next)
  }

  return { theme, setTheme, applyTheme }
}
