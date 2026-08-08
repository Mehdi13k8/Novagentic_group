# Handoff — Novagentic & Palier : état du design, et ce qui reste à faire

Document de passation pour une session de design (UI/UX). Il décrit ce qui
est **déjà en production**, les contraintes à respecter, et ce qui reste
ouvert. Tout ce qui est décrit comme fait a été vérifié en production, pas
seulement écrit.

---

## 1. Le contexte en trois lignes

Un dépôt, deux produits distincts :

| | Novagentic | Palier |
|---|---|---|
| Quoi | Site vitrine d'un cabinet d'ingénierie (2 fondateurs, Marseille) | SaaS de rapprochement locatif |
| URL | https://novagentic.fr | https://palier.novagentic.fr |
| Code | `app/` (racine) | `palier/` |
| Public | Prospects B2B | Bailleurs particuliers utilisant Rentila |
| Prix | — | 3 €/mois |

Deux applications Nuxt 4 + Tailwind v4 **séparées** (build, déploiement,
`package.json` indépendants), mais elles tournent comme deux conteneurs sur
la même Web App Azure, routées par `Host` via `proxy/nginx.conf`.

**Ce que fait Palier :** il relie le compte bancaire du bailleur à ses loyers
Rentila et rapproche automatiquement les virements reçus des échéances
attendues. Le pointage manuel de fin de mois disparaît.

---

## 2. Le système de design actuel

### Palette

Définie deux fois — `app/assets/css/main.css` et
`palier/app/assets/css/main.css`. **Les deux fichiers sont copiés, pas
importés : toute modification doit être reportée dans les deux.**

| Token | Sombre | Clair |
|---|---|---|
| `--color-bg` | `#0a0a0b` | `#f4f1e8` |
| `--color-bg-raised` | `#121214` | `#fffefa` |
| `--color-bg-sunken` | `#18181c` | `#ebe5d6` |
| `--color-fg` | `#eee2c8` | `#1c1811` |
| `--color-fg-soft` | `#a89b7d` | `#6f6753` |
| `--color-cobalt` | `#5d78ff` | `#3450e0` |
| `--color-signal` (aplat) | `#f5a524` | `#f5a524` |
| `--color-signal-text` | `#f5a524` | `#8a5a00` |
| `--color-ok` / `--color-ok-text` | `#34d399` | `#0e7a55` |
| `--color-danger-text` | `#f87171` | `#bf2f2f` |
| `--color-line` | `rgba(238,226,200,.14)` | `rgba(28,24,17,.13)` |
| `--color-on-accent` | `#0a0a0b` | `#0a0a0b` |
| `--color-on-cobalt` | `#0a0a0b` | `#fffefa` |

**Trois tokens méritent une explication, parce qu'ils encodent des pièges
mesurés, pas des préférences :**

1. **`signal` vs `signal-text`.** L'ambre de marque `#f5a524` ne fait que
   **1,75:1** sur fond papier — illisible en petit texte. L'aplat garde la
   couleur de marque (le texte posé dessus est sombre, 9,7:1), le texte
   passe à `#8a5a00`. Même logique pour le vert : `#34d399` tombe à
   **1,65:1** en clair, d'où `#0e7a55`.
2. **`on-cobalt` s'inverse selon le thème.** `text-white` sur un bouton
   cobalt donnait **3,75:1** en sombre — un défaut d'accessibilité qui
   existait *avant* ce chantier. Le cobalt est clair en thème sombre (texte
   sombre) et foncé en thème clair (texte blanc).
3. **`shine`.** Le balayage du titre passait par `#fff` : sur fond papier le
   mot *disparaît* au lieu de briller. Il vire vers l'ambre foncé en clair.

Toutes les paires ont été validées ≥ 4,5:1 pour le texte et ≥ 3:1 pour les
éléments graphiques, dans **les deux** thèmes.

> Origine de la palette : elle reprend les valeurs d'une maquette de
> dashboard validée en amont, à une correction près (celle du point 1
> ci-dessus, dont la maquette souffrait).

### Thème — trois états, pas deux

C'est le point le plus facile à casser. Le lecteur peut être dans **trois**
états, et le troisième est le défaut :

```css
@theme { /* SOMBRE — la marque est sombre par défaut */ }

@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) { /* clair système */ }
}

:root[data-theme='light'] { /* clair explicite */ }
```

- Choix explicite clair → `data-theme="light"` sur `<html>`
- Choix explicite sombre → `data-theme="dark"`
- **« Système » → aucun attribut**, et seul `prefers-color-scheme` tranche

**Une couleur définie uniquement dans un bloc `@media` ne s'applique jamais
dans l'état non marqué** : c'est le bug classique du texte d'un thème sur le
fond de l'autre. Toute nouvelle couleur passe par un token défini dans les
trois blocs.

Le sélecteur « Système » doit rester atteignable : un simple interrupteur
sombre/clair fige le visiteur dès le premier clic, sans retour possible au
suivi de sa préférence système.

### Typographie

- **Archivo** (variable, `wdth` 75–125, `wght` 400–900) — titres.
  `.display` = `font-stretch: 118%`, `weight: 800`, `letter-spacing: -0.035em`,
  `line-height: 0.92`, majuscules.
- **IBM Plex Mono** — `.eyebrow` (0,72rem, `letter-spacing: 0.14em`,
  majuscules) et `.coords` (0,7rem).

Les deux polices viennent de Google Fonts, chargées via `<link>` dans
`nuxt.config.ts`.

### Langue

Dictionnaire maison, **pas `@nuxtjs/i18n`** — ce module apporte surtout des
URL par langue (`/en/…`), ce qui changerait le routage de sites déjà en
ligne et la configuration du proxy.

- `app/i18n/messages.ts` — site vitrine (83 clés)
- `palier/app/i18n/messages.ts` — Palier (216 clés)
- `useLocale()` / `useTheme()` dans `app/composables/useAppearance.ts`
- Composant `AppearanceControls.vue` : segment Sombre/Clair/Système +
  segment FR/EN

Deux choix structurants :

- **Cookie, pas localStorage.** Le rendu est serveur : seul un cookie est
  lisible côté serveur, donc la bonne version part directement. Avec
  localStorage, chaque chargement partirait en français/sombre puis
  basculerait après hydratation — un flash visible.
- **Cookie élargi à `.novagentic.fr` en production.** Les deux applications
  sont sur deux hôtes ; sans ça, choisir l'anglais sur le site vitrine puis
  cliquer « Découvrir Palier » ramènerait au français. En local, aucun
  domaine n'est posé (un cookie portant un domaine que l'hôte ne satisfait
  pas est rejeté).

Le français est la langue de référence des deux côtés.

---

## 3. Ce qui est fait et en production

**Site vitrine (`app/`)**
- Thème clair/sombre complet, bilingue FR/EN
- Section **Produits** présentant Palier — le produit n'était mentionné
  nulle part sur le site du cabinet
- Marqueurs `01/02/03/04` **supprimés** des 4 savoir-faire : ils affirmaient
  une séquence qui n'existe pas. Remplacés par une étiquette de domaine
  (`Data · Scoring · IA`, `Legacy`, `Migrations`, `Architecture`), qui dit
  quelque chose de vrai. *La numérotation est conservée sur les 3 étapes de
  Palier, où l'ordre est réel.*
- `makesOffer` ajouté au JSON-LD

**Palier (`palier/`)**
- Thème clair/sombre complet, bilingue FR/EN sur **toute** l'application
  (public + authentifié)
- **Vraie page produit** en remplacement d'une page d'état qui exposait
  publiquement un panneau `/api/health` : hero, problème/solution, 3 étapes,
  sécurité, limites, tarif
- Section « Ce que Palier ne fait pas », **placée avant le prix**
- Tableau de bord entièrement traduit (il était en anglais sous une
  navigation française)

**Les deux**
- 49 couleurs Tailwind figées (`text-white`, `text-green-500`…) remplacées
  par des tokens — elles ne suivaient aucun thème
- Aucune couleur en dur ne subsiste hors des blocs de thème (vérifié)

### Maquettes validées dans ce projet (`Palier App.dc.html`)

La maquette interactive couvre déjà, en FR/EN et dans les deux thèmes
(tokens du §2 y compris `signal-text` clair et `on-cobalt` inversé) :

- **Connexion** conçue : validation inline, spinner, état d'erreur, succès
- **Vue d'ensemble** répondant à « que dois-je faire aujourd'hui ? » :
  6 KPI (encaissé, charges, résultat, à rapprocher, impayés, occupation)
  + liste « À traiter » actionnable + encaissements 6 mois
- **Rapprochement** repensé : onglets par état, validation ligne à ligne
  avec badge de confiance, « Tout valider », panneau d'association manuelle
  (plus une ligne de tableau), association **multi-écritures**
  (partiel/groupé), toast « Créer une règle » après association manuelle
- **États vides / chargement** : squelettes shimmer, parcours premier jour
  (accueil 3 étapes, rapprochement vide accompagné, banque vide expliquant
  le flux Enable Banking — Bridge n'apparaît pas, détail d'implémentation)
- **Relance locataire** (modal email pré-rédigé), **pack fiscal 2044**,
  **multi-entités** (sélecteur d'en-tête), **Réglages** : profil, entités,
  seuil auto (slider), règles, notifications (rapport mensuel, impayé,
  renouvellement DSP2), export complet
- Feedback sur chaque action : toasts avec « Annuler »

Ces écrans servent de cible pour redévelopper `dashboard/*.vue` — les
points §4.1 et §4.2 sont **conçus en maquette, pas encore portés en code**.

---

## 4. Ce qui reste ouvert — le vrai sujet de la prochaine session

Le **système** est en place et correct. Ce qui n'a pas été traité, c'est la
**conception d'interface** : la mise en page, la hiérarchie, les états. Le
travail décrit ci-dessus a porté sur les tokens et les chaînes, pas sur
l'ergonomie.

### 4.1 Le tableau de bord — conçu en maquette, à porter en code

La conception est faite dans `Palier App.dc.html` (voir §3). Reste à porter
ces écrans dans `palier/app/pages/dashboard/` : les écrans en production
sont fonctionnels mais visuellement bruts — des tableaux HTML, des cartes
empilées, très peu de hiérarchie. Ils datent d'avant tout travail de design.

- **`index.vue` (Vue d'ensemble)** — 3 tuiles d'état + un encart abonnement.
  Aucune synthèse : le bailleur ne voit pas *ce qu'il doit faire aujourd'hui*.
  Le montant encaissé ce mois-ci, les impayés, ce qui attend une décision —
  rien n'est mis en avant.
- **`virements.vue`** — l'écran central du produit. Tableau brut où le
  rapprochement (le cœur de la valeur) n'est qu'une colonne parmi cinq. Le
  sélecteur de rattachement manuel s'ouvre dans une ligne de tableau
  supplémentaire, ce qui est fonctionnel mais peu lisible.
- **`payments.vue`**, **`accounting.vue`** — tableaux, avec un unique
  graphique SVG fait main dans `accounting.vue`.
- **`integrations.vue`** — trois sections empilées, dont deux agrégateurs
  bancaires concurrents (Bridge et Enable Banking) exposés côte à côte au
  bailleur, ce qui est un détail d'implémentation qui ne devrait pas le
  concerner.

**Attention en retravaillant ces écrans :** l'état (rapproché / non rapproché
/ en retard) doit rester lisible **sans dépendre uniquement de la couleur**,
et les couleurs sémantiques (`ok`, `danger`, `signal`) sont distinctes de la
couleur d'accent (`cobalt`).

### 4.2 États vides, chargement, erreurs — conçus en maquette, à porter

En production : traités a minima, en une phrase de texte gris, pas de
squelettes, erreurs en texte rouge. La maquette définit la cible (parcours
premier jour, squelettes, erreurs de formulaire — tweak `premierJour`).

### 4.3 Mobile — non traité (ni en prod, ni en maquette)

Jamais vérifié sérieusement. Les tableaux ont `overflow-x: auto`, donc ils
défilent, mais aucun écran n'a été pensé pour petit écran. La barre de
navigation du tableau de bord est devenue dense (nav + réglages + email +
déconnexion) et passe à la ligne plutôt que de s'adapter.

### 4.4 Le graphique

`accounting.vue` contient un graphique SVG écrit à la main (barres groupées
encaissements/charges, 12 mois). Ses deux couleurs (`#059669`, `#ef4444`)
sont **volontairement figées** et non tokenisées : elles ont été validées
séparément et tiennent dans les deux thèmes (4,97:1 en sombre, 3,73:1 en
clair). Le commentaire en tête du fichier explique ce choix — à lire avant
d'y toucher.

### 4.5 Points mineurs

- Pas de favicon ni d'OG image propres à Palier
- Pas de page 404 conçue
- Les pages `legal/terms` et `legal/privacy` de Palier ne sont pas traduites
  (contenu juridique, volontairement laissé de côté)
- Le site vitrine et Palier ont des en-têtes différents — cohérence de
  marque à arbitrer

---

## 5. Contraintes à ne pas casser

1. **Les deux `main.css` sont copiés, pas partagés.** Toute modification de
   palette doit être reportée dans les deux fichiers.
2. **Trois états de thème**, jamais deux (voir §2). Ne jamais définir une
   couleur uniquement dans un `@media`.
3. **Ne pas promettre ce que le produit ne fait pas.** L'API Rentila est en
   **lecture seule** : Palier ne peut pas marquer une quittance comme payée.
   Le dernier clic revient au bailleur, et la section « limites » le dit.
   Aucune formulation ne doit laisser croire l'inverse.
4. **Stellantis / BNP Paribas / Free Pro / Crossdock** sont les entreprises
   où les fondateurs se sont **formés**, *pas* des clients. Le libellé
   « Formés là où l'erreur n'est pas permise » est exact et ne doit pas
   devenir un mur de logos clients.
5. **Toute nouvelle couleur passe par un token** défini dans les trois blocs
   de thème, et validée ≥ 4,5:1 (texte) / ≥ 3:1 (graphique) dans les deux
   thèmes.
6. **Structure = information.** Une numérotation ne s'emploie que si le
   contenu est réellement une séquence (c'est pourquoi elle a été retirée
   des savoir-faire et conservée sur les étapes de connexion).

---

## 6. Démarrer

```bash
# Site vitrine — http://localhost:3000
npm install && npm run dev

# Palier — https://localhost:3000 (TLS auto-signé, requis par Enable Banking)
cd palier && npm install && npm run dev
```

Fichiers d'entrée pour le design :

| Sujet | Fichier |
|---|---|
| Palette / thèmes | `app/assets/css/main.css`, `palier/app/assets/css/main.css` |
| Textes | `app/i18n/messages.ts`, `palier/app/i18n/messages.ts` |
| Langue + thème | `app/composables/useAppearance.ts` |
| Réglages (UI) | `app/components/AppearanceControls.vue` |
| Page d'accueil vitrine | `app/pages/index.vue` |
| Page produit Palier | `palier/app/pages/index.vue` |
| **Écrans à retravailler** | `palier/app/pages/dashboard/*.vue` |

---

## 7. Ce que j'attends de cette session

Par ordre de valeur (1 et 2 sont **conçus en maquette** — reste le portage
Nuxt ; 3 et 4 restent entièrement à faire) :

1. ~~Concevoir le tableau de bord de Palier~~ — fait en maquette
   (`Palier App.dc.html`) ; à porter dans `dashboard/*.vue`.
2. ~~États vides, chargement, erreurs~~ — fait en maquette (parcours
   premier jour) ; à porter.
3. **Mobile** — au minimum les écrans du tableau de bord. À concevoir
   (maquette puis code).
4. **Critique du reste** : la page produit Palier et la page d'accueil du
   site vitrine viennent d'être refaites, mais un regard neuf sur la
   hiérarchie, le rythme vertical et la densité est bienvenu.

Écarts connus de la maquette à corriger lors du portage :

- Le sélecteur de thème de la maquette n'a que 2 états (Sombre/Clair) — la
  production en exige **3** (+ Système, voir §2).
- La maquette persiste son état en mémoire — la production utilise le
  **cookie** `.novagentic.fr` (voir §2).

Le système de couleurs et de thèmes est solide et mesuré : il vaut mieux
s'appuyer dessus que le refaire. En revanche, la mise en page du tableau de
bord n'a jamais été conçue — c'est là que le gain est le plus grand.
