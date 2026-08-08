export type Locale = 'fr' | 'en'

/**
 * Le français est la langue de référence : Palier s'adresse à des bailleurs
 * français, branchés sur Rentila (service français) et sur des banques
 * françaises. Le tableau de bord était pourtant écrit en anglais alors que
 * le site vitrine est en français — c'est corrigé ici, le français devient
 * la version par défaut des deux côtés.
 *
 * Règle en ajoutant des clés : ne pas promettre ce que le produit ne fait
 * pas. La section « limites » existe précisément pour ça, et l'API Rentila
 * étant en lecture seule, aucune formulation ne doit laisser croire que
 * Palier écrit dans Rentila.
 */
export const messages: Record<Locale, Record<string, string>> = {
  fr: {
    'appearance.lang': 'Choisir une langue',
    'appearance.theme': 'Choisir un thème',
    'appearance.dark': 'Sombre',
    'appearance.light': 'Clair',
    'appearance.system': 'Système',

    'brand.by': 'par Novagentic',

    'nav.how': 'Fonctionnement',
    'nav.security': 'Sécurité',
    'nav.limits': 'Limites',
    'nav.pricing': 'Tarif',
    'nav.login': 'Se connecter',
    'nav.cta': 'Essayer Palier',

    'hero.eyebrow': 'Rapprochement locatif · Rentila',
    'hero.title': 'Le loyer est tombé',
    'hero.lede':
      'Palier surveille le compte du bailleur, reconnaît les virements de loyer et les rapproche des échéances Rentila. Le pointage de fin de mois disparaît.',
    'hero.cta': 'Essayer — 3 € / mois',
    'hero.cta2': 'Voir le fonctionnement',
    'hero.note': 'Connexion bancaire par redirection · Aucun identifiant stocké',

    'ledger.title': 'Virements reçus',
    'ledger.matched': 'Rapproché',
    'ledger.review': 'À classer',
    'ledger.r1': 'Loyer juillet · T3 Joliette · échéance 05/07',
    'ledger.r2': 'Aucune échéance correspondante — à classer',
    'ledger.caption': 'Aperçu du tableau de bord — données d’illustration.',

    'problem.eyebrow': 'Le problème',
    'problem.title': 'Chaque mois, la même corvée',
    'problem.without': 'Sans Palier',
    'problem.w1': 'Ouvrir l’appli bancaire, dérouler les virements du mois.',
    'problem.w2': 'Comparer chaque montant avec les échéances Rentila, une par une.',
    'problem.w3': 'Repérer soi-même le loyer payé en retard, ou en deux fois.',
    'problem.w4': 'Marquer la quittance comme réglée. Recommencer le mois suivant.',
    'problem.with': 'Avec Palier',
    'problem.p1': 'Les virements arrivent seuls, toutes les 30 minutes.',
    'problem.p2': 'Ceux qui correspondent à une échéance sont rapprochés automatiquement.',
    'problem.p3': 'Ceux qui ne correspondent à rien sont signalés, pas noyés.',
    'problem.p4': 'Vous n’ouvrez Palier que quand il reste une décision à prendre.',

    'how.eyebrow': 'Mise en route',
    'how.title': 'Trois étapes, une seule fois',
    'how.lede': 'Ces trois étapes sont un ordre réel : chacune a besoin de la précédente.',
    'how.s1.n': 'Étape 1',
    'how.s1.t': 'Reliez Rentila',
    'how.s1.b':
      'Vous générez vos identifiants d’API depuis votre compte Rentila et les collez dans Palier. Vos biens, locataires, baux et échéances remontent.',
    'how.s2.n': 'Étape 2',
    'how.s2.t': 'Reliez la banque',
    'how.s2.b':
      'Vous êtes redirigé vers votre banque pour autoriser la lecture du compte. Vos identifiants bancaires ne passent jamais par Palier.',
    'how.s3.n': 'Étape 3',
    'how.s3.t': 'Laissez tourner',
    'how.s3.b':
      'Palier relit le compte toutes les 30 minutes, rapproche ce qui correspond et vous laisse trancher le reste.',

    'sec.eyebrow': 'Sécurité',
    'sec.title': 'Ce que Palier voit, et ce qu’il ne voit pas',
    'sec.c1.t': 'Vos identifiants bancaires',
    'sec.c1.b':
      'Nous ne les voyons jamais. L’autorisation se fait sur le site de votre banque, par redirection — Palier ne reçoit qu’un accès en lecture, révocable, à durée limitée.',
    'sec.c2.t': 'Lecture seule, jamais de mouvement',
    'sec.c2.b':
      'Palier lit des opérations. Il ne peut initier aucun virement, ni sur votre compte, ni depuis celui d’un locataire.',
    'sec.c3.t': 'Un virement, une seule affectation',
    'sec.c3.b':
      'Le rapprochement est atomique : un même virement ne peut pas solder deux échéances, même si deux synchronisations se croisent.',
    'sec.c4.t': 'Vos secrets, chiffrés',
    'sec.c4.b':
      'Les identifiants d’API Rentila sont chiffrés avant d’être stockés. Chaque bailleur est isolé des autres.',

    'lim.eyebrow': 'En toute franchise',
    'lim.title': 'Ce que Palier ne fait pas',
    'lim.lede':
      'Autant le dire avant que vous payiez : ces limites sont réelles, et certaines tiennent à Rentila, pas à nous.',
    'lim.q1': 'Palier n’écrit pas dans Rentila',
    'lim.a1':
      'L’API Rentila est en lecture seule pour les applications tierces. Quand un virement est rapproché, Palier vous amène directement sur la bonne quittance dans Rentila — le dernier clic reste le vôtre.',
    'lim.q2': 'Palier ne relance pas vos locataires',
    'lim.a2':
      'Il vous dit ce qui manque et depuis quand. L’envoi des relances n’est pas au programme aujourd’hui.',
    'lim.q3': 'Votre banque limite les consultations',
    'lim.a3':
      'La réglementation européenne plafonne le nombre de relevés qu’un service comme Palier peut demander par jour. Palier espace donc ses appels et vous le dit clairement s’il doit patienter.',
    'lim.q4': 'L’autorisation bancaire expire',
    'lim.a4':
      'Votre banque fixe la durée de l’accord, souvent 90 jours. Palier vous prévient avant l’échéance : il suffit de re-valider chez votre banque.',

    'price.eyebrow': 'Tarif',
    'price.title': 'Un prix, pas une grille',
    'price.lede':
      'Le même tarif direct que chez Novagentic : ce que ça coûte à faire tourner, plus de quoi continuer à le construire.',
    'price.plan': 'Abonnement',
    'price.unit': '/ mois',
    'price.f1': 'Biens, locataires et baux illimités.',
    'price.f2': 'Un compte bancaire relié.',
    'price.f3': 'Rapprochement automatique toutes les 30 minutes.',
    'price.f4': 'Sans engagement — résiliable en un clic.',
    'price.cta': 'Créer mon compte →',
    'price.note': 'Paiement par Stripe.',

    'nav.dashboard': 'Vue d’ensemble',
    'nav.integrations': 'Intégrations',
    'nav.payments': 'Loyers',
    'nav.virements': 'Virements',
    'nav.accounting': 'Comptabilité',
    'nav.logout': 'Se déconnecter',

    'footer.tagline': 'Rapprochement locatif — Marseille',
  },

  en: {
    'appearance.lang': 'Choose a language',
    'appearance.theme': 'Choose a theme',
    'appearance.dark': 'Dark',
    'appearance.light': 'Light',
    'appearance.system': 'System',

    'brand.by': 'by Novagentic',

    'nav.how': 'How it works',
    'nav.security': 'Security',
    'nav.limits': 'Limits',
    'nav.pricing': 'Pricing',
    'nav.login': 'Log in',
    'nav.cta': 'Try Palier',

    'hero.eyebrow': 'Rent reconciliation · Rentila',
    'hero.title': 'The rent landed',
    'hero.lede':
      "Palier watches the landlord's account, recognises rent transfers and matches them to Rentila due dates. The month-end tick-off disappears.",
    'hero.cta': 'Try it — €3 / month',
    'hero.cta2': 'See how it works',
    'hero.note': 'Bank connection by redirect · No credentials stored',

    'ledger.title': 'Incoming transfers',
    'ledger.matched': 'Matched',
    'ledger.review': 'Review',
    'ledger.r1': 'July rent · 3-room, Joliette · due 05/07',
    'ledger.r2': 'No matching due date — needs review',
    'ledger.caption': 'Dashboard preview — illustrative data.',

    'problem.eyebrow': 'The problem',
    'problem.title': 'Every month, the same chore',
    'problem.without': 'Without Palier',
    'problem.w1': "Open the banking app, scroll through the month's transfers.",
    'problem.w2': 'Compare each amount against Rentila due dates, one by one.',
    'problem.w3': 'Spot the rent paid late, or in two instalments, yourself.',
    'problem.w4': 'Mark the rent record as settled. Start again next month.',
    'problem.with': 'With Palier',
    'problem.p1': 'Transfers arrive on their own, every 30 minutes.',
    'problem.p2': 'Those matching a due date are reconciled automatically.',
    'problem.p3': 'Those matching nothing are flagged, not buried.',
    'problem.p4': 'You only open Palier when a decision is left to make.',

    'how.eyebrow': 'Getting started',
    'how.title': 'Three steps, once',
    'how.lede': 'These three steps are a real order: each one needs the one before it.',
    'how.s1.n': 'Step 1',
    'how.s1.t': 'Connect Rentila',
    'how.s1.b':
      'You generate your API credentials from your Rentila account and paste them into Palier. Your properties, tenants, leases and due dates come across.',
    'how.s2.n': 'Step 2',
    'how.s2.t': 'Connect the bank',
    'how.s2.b':
      'You are redirected to your bank to authorise read access. Your banking credentials never pass through Palier.',
    'how.s3.n': 'Step 3',
    'how.s3.t': 'Let it run',
    'how.s3.b':
      'Palier re-reads the account every 30 minutes, matches what fits and leaves you to settle the rest.',

    'sec.eyebrow': 'Security',
    'sec.title': "What Palier sees, and what it doesn't",
    'sec.c1.t': 'Your banking credentials',
    'sec.c1.b':
      "We never see them. Authorisation happens on your bank's own site, by redirect — Palier receives only read access, revocable and time-limited.",
    'sec.c2.t': 'Read-only, never a movement',
    'sec.c2.b':
      "Palier reads transactions. It cannot initiate any transfer, on your account or a tenant's.",
    'sec.c3.t': 'One transfer, one settlement',
    'sec.c3.b':
      'Matching is atomic: the same transfer cannot settle two due dates, even if two syncs overlap.',
    'sec.c4.t': 'Your secrets, encrypted',
    'sec.c4.b':
      'Rentila API credentials are encrypted before storage. Each landlord is isolated from the others.',

    'lim.eyebrow': 'Straight with you',
    'lim.title': "What Palier doesn't do",
    'lim.lede':
      "Better said before you pay: these limits are real, and some of them are Rentila's, not ours.",
    'lim.q1': "Palier doesn't write back into Rentila",
    'lim.a1':
      'The Rentila API is read-only for third-party apps. When a transfer is matched, Palier takes you straight to the right record in Rentila — the last click stays yours.',
    'lim.q2': "Palier doesn't chase your tenants",
    'lim.a2':
      "It tells you what's missing and since when. Sending reminders isn't on the roadmap today.",
    'lim.q3': 'Your bank limits how often we can look',
    'lim.a3':
      'European regulation caps how many statements a service like Palier may request per day. Palier spaces out its calls accordingly, and says so plainly if it has to wait.',
    'lim.q4': 'Bank authorisation expires',
    'lim.a4':
      'Your bank sets how long the consent lasts, often 90 days. Palier warns you before it runs out: you just re-approve with your bank.',

    'price.eyebrow': 'Pricing',
    'price.title': 'One price, not a matrix',
    'price.lede':
      'The same direct rate as Novagentic: what it costs to run, plus enough to keep building it.',
    'price.plan': 'Subscription',
    'price.unit': '/ month',
    'price.f1': 'Unlimited properties, tenants and leases.',
    'price.f2': 'One connected bank account.',
    'price.f3': 'Automatic matching every 30 minutes.',
    'price.f4': 'No commitment — cancel in one click.',
    'price.cta': 'Create my account →',
    'price.note': 'Payment by Stripe.',

    'nav.dashboard': 'Overview',
    'nav.integrations': 'Integrations',
    'nav.payments': 'Payments',
    'nav.virements': 'Transfers',
    'nav.accounting': 'Accounting',
    'nav.logout': 'Log out',

    'footer.tagline': 'Rent reconciliation — Marseille',
  },
}
