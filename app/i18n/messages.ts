export type Locale = 'fr' | 'en'

/**
 * Le français est la langue de référence : c'est le marché du cabinet, et
 * c'est la version qui fait foi si les deux divergent. L'anglais n'est pas
 * une traduction littérale — « Pas d'agence-façade » n'a pas d'équivalent
 * mot à mot, la version anglaise rend l'intention.
 *
 * Une règle à tenir en ajoutant des clés : les entreprises citées sous
 * `provenance.label` sont celles où les fondateurs se sont FORMÉS, pas des
 * clients. Ne pas reformuler en référence client.
 */
export const messages: Record<Locale, Record<string, string>> = {
  fr: {
    'appearance.lang': 'Choisir une langue',
    'appearance.theme': 'Choisir un thème',
    'appearance.dark': 'Sombre',
    'appearance.light': 'Clair',
    'appearance.system': 'Système',

    'nav.offres': 'Offres',
    'nav.produits': 'Produits',
    'nav.fondateurs': 'Fondateurs',
    'nav.experience': 'Expérience',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.cta': 'Parler de votre projet',

    'hero.status': 'Disponibles immédiatement · Tarif direct',
    'hero.title': "Pas d'agence-façade",
    'hero.lede':
      'Chaque mission est prise en charge directement par les deux fondateurs. Ingénierie logicielle & data, pour équipes qui n’ont pas droit à l’erreur.',
    'hero.cta': 'Décrivez-nous votre contexte →',
    'hero.cta2': 'Voir Palier',
    'hero.reply': 'Réponse sous 24 h, par un fondateur.',

    'provenance.label': "Formés là où l'erreur n'est pas permise",

    'offres.eyebrow': 'Ce que nous savons construire',
    'offres.title': "Notre terrain de jeu : l'exigence",
    'offres.c1.tag': 'Data · Scoring · IA',
    'offres.c1.title': 'Décider sur des chiffres, pas des intuitions',
    'offres.c1.body':
      'Modélisation, scoring et analytics au service de décisions concrètes — affinés au contact des enjeux d’un grand groupe bancaire.',
    'offres.c2.tag': 'Legacy',
    'offres.c2.title': 'Remis à niveau sans tout casser',
    'offres.c2.body':
      'Des systèmes vieillissants fiabilisés progressivement — comme le legacy d’un géant automobile, enfin à niveau.',
    'offres.c3.tag': 'Migrations',
    'offres.c3.title': "Changer de socle sans arrêter le service",
    'offres.c3.body':
      'Une comptabilité fragile transformée en socle fiable, une logistique bloquée sur FileMaker, libérée.',
    'offres.c4.tag': 'Architecture',
    'offres.c4.title': 'Des systèmes qui encaissent la charge',
    'offres.c4.body':
      'Pensés pour les équipes financières et industrielles qui ne peuvent pas se permettre de voir tomber leurs systèmes.',

    'produits.eyebrow': 'Nos produits',
    'produits.title': 'On ne fait pas que conseiller. On expédie.',
    'produits.lede':
      'La même exigence, appliquée à nos propres logiciels. Palier est le premier : en ligne, facturé, utilisé.',
    'produits.palier.eyebrow': 'Palier — rapprochement locatif',
    'produits.palier.title': 'Le virement est arrivé. Votre quittance le sait déjà.',
    'produits.palier.body':
      'Palier relie le compte bancaire du bailleur à ses loyers Rentila et rapproche les virements reçus tout seul. Plus de pointage manuel en fin de mois.',
    'produits.palier.b1': 'Connexion bancaire par redirection — les identifiants ne transitent jamais par nous.',
    'produits.palier.b2': 'Rapprochement automatique, relancé toutes les 30 minutes.',
    'produits.palier.b3': 'Chaque virement pointé vers la quittance correspondante.',
    'produits.palier.unit': '/ mois · sans engagement',
    'produits.palier.cta': 'Découvrir Palier →',
    'produits.palier.ledger': 'Virements reçus',
    'produits.palier.matched': 'Rapproché',
    'produits.palier.r1': '↳ Loyer juillet · T3 Joliette · échéance 05/07',
    'produits.palier.r2': '↳ Aucune échéance correspondante — à classer',
    'produits.palier.alt':
      'Aperçu de Palier : un virement bancaire de 430 euros rapproché automatiquement d’un loyer du même montant.',

    'fondateurs.eyebrow': 'Derrière Novagentic',
    'fondateurs.title': 'Deux experts, une exigence',
    'fondateurs.lede':
      'Pas d’agence-façade : chaque mission est prise en charge directement par les fondateurs, formés dans des environnements où l’erreur coûte cher.',
    'fondateurs.mehdi.role': 'Ingénierie & architecture',
    'fondateurs.mehdi.bio':
      'Construit les systèmes que les équipes financières et industrielles ne peuvent pas se permettre de voir tomber : legacy fiabilisé, migrations sans interruption de service, architectures qui encaissent la charge.',
    'fondateurs.martin.role': 'Data & intelligence',
    'fondateurs.martin.bio':
      'Affine son expertise data au contact des enjeux d’un grand groupe bancaire : modélisation, scoring et analytics au service de décisions concrètes.',

    'why.eyebrow': 'Pourquoi nous',
    'why.title': 'Ce que « sans agence-façade » veut dire',
    'why.r1.t': 'Vos interlocuteurs font le travail.',
    'why.r1.b': 'Pas de commercial, pas de sous-traitance : vous parlez à ceux qui codent.',
    'why.r2.t': 'Tarif direct.',
    'why.r2.b': 'Sans intermédiaire ni marge d’agence — l’expertise senior, au prix juste.',
    'why.r3.t': 'Disponibles immédiatement.',
    'why.r3.b': 'Un premier échange cette semaine, un démarrage rapide.',
    'why.r4.t': "L'exigence comme standard.",
    'why.r4.b':
      'Formés dans l’automobile, la banque, la finance et la logistique — là où l’erreur coûte cher.',

    'blog.eyebrow': 'Blog',
    'blog.title': 'Notes de terrain',
    'blog.all': 'Tous les articles ↗',
    'blog.empty': 'Rien ici pour l’instant. Le premier article arrive bientôt.',
    'blog.read': 'Lire →',
    'blog.back': '← Tous les articles',
    'blog.index.lede': 'Ce qu’on apprend en construisant, écrit sans enrobage.',

    'contact.eyebrow': 'Parlons-en',
    'contact.title': 'Un projet, une question ?',
    'contact.lede':
      'Décrivez-nous votre contexte — legacy, migration, data, IA. Un fondateur vous répond sous 24 h.',
    'contact.name': 'Nom *',
    'contact.email': 'Email *',
    'contact.company': 'Société',
    'contact.message': 'Message *',
    'contact.send': 'Envoyer →',
    'contact.sending': 'Envoi…',
    'contact.okTitle': 'Bien reçu.',
    'contact.okBody': 'Un fondateur revient vers vous sous 24 h.',
    'contact.again': '← Envoyer un autre message',
    'contact.error':
      'Une erreur est survenue, réessayez ou écrivez-nous directement sur LinkedIn.',

    'footer.rights': 'Ingénierie logicielle & data — Marseille',
  },

  en: {
    'appearance.lang': 'Choose a language',
    'appearance.theme': 'Choose a theme',
    'appearance.dark': 'Dark',
    'appearance.light': 'Light',
    'appearance.system': 'System',

    'nav.offres': 'Services',
    'nav.produits': 'Products',
    'nav.fondateurs': 'Founders',
    'nav.experience': 'Experience',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.cta': 'Discuss your project',

    'hero.status': 'Available now · Direct rates',
    'hero.title': 'No agency front',
    'hero.lede':
      'Every engagement is handled directly by the two founders. Software and data engineering, for teams that cannot afford to get it wrong.',
    'hero.cta': 'Tell us about your situation →',
    'hero.cta2': 'See Palier',
    'hero.reply': 'A founder replies within 24 hours.',

    'provenance.label': "Trained where mistakes aren't an option",

    'offres.eyebrow': 'What we build',
    'offres.title': 'Our home ground: work that has to hold',
    'offres.c1.tag': 'Data · Scoring · AI',
    'offres.c1.title': 'Decisions from numbers, not hunches',
    'offres.c1.body':
      'Modelling, scoring and analytics in service of concrete decisions — sharpened against the demands of a major banking group.',
    'offres.c2.tag': 'Legacy',
    'offres.c2.title': 'Brought up to standard without breaking it',
    'offres.c2.body':
      'Ageing systems made dependable step by step — like the legacy estate of an automotive giant, finally up to standard.',
    'offres.c3.tag': 'Migrations',
    'offres.c3.title': 'New foundations, no downtime',
    'offres.c3.body':
      'A fragile accounting system turned into a dependable one; a logistics operation stuck on FileMaker, set free.',
    'offres.c4.tag': 'Architecture',
    'offres.c4.title': 'Systems that take the load',
    'offres.c4.body':
      'Built for the finance and industrial teams that cannot afford to watch their systems go down.',

    'produits.eyebrow': 'Our products',
    'produits.title': "We don't just advise. We ship.",
    'produits.lede':
      'The same standard, applied to our own software. Palier is the first: live, billed, in use.',
    'produits.palier.eyebrow': 'Palier — rent reconciliation',
    'produits.palier.title': 'The transfer landed. Your rent record already knows.',
    'produits.palier.body':
      "Palier links a landlord's bank account to their Rentila rent schedule and reconciles incoming transfers on its own. No more month-end tick-off.",
    'produits.palier.b1': 'Bank connection by redirect — credentials never pass through us.',
    'produits.palier.b2': 'Automatic reconciliation, re-run every 30 minutes.',
    'produits.palier.b3': 'Every transfer pointed at the rent record it settles.',
    'produits.palier.unit': '/ month · cancel anytime',
    'produits.palier.cta': 'Discover Palier →',
    'produits.palier.ledger': 'Incoming transfers',
    'produits.palier.matched': 'Matched',
    'produits.palier.r1': '↳ July rent · 3-room, Joliette · due 05/07',
    'produits.palier.r2': '↳ No matching due date — needs review',
    'produits.palier.alt':
      'Preview of Palier: a 430 euro bank transfer matched automatically to a rent payment of the same amount.',

    'fondateurs.eyebrow': 'Behind Novagentic',
    'fondateurs.title': 'Two specialists, one standard',
    'fondateurs.lede':
      'No agency front: every engagement is handled directly by the founders, trained in environments where mistakes are expensive.',
    'fondateurs.mehdi.role': 'Engineering & architecture',
    'fondateurs.mehdi.bio':
      'Builds the systems finance and industrial teams cannot afford to watch go down: legacy made dependable, migrations without a service break, architectures that take the load.',
    'fondateurs.martin.role': 'Data & intelligence',
    'fondateurs.martin.bio':
      'Sharpens his data expertise against the demands of a major banking group: modelling, scoring and analytics in service of concrete decisions.',

    'why.eyebrow': 'Why us',
    'why.title': "What 'no agency front' actually means",
    'why.r1.t': 'The people you talk to do the work.',
    'why.r1.b': 'No account manager, no subcontracting: you speak to whoever writes the code.',
    'why.r2.t': 'Direct rates.',
    'why.r2.b': 'No middleman, no agency margin — senior expertise at the honest price.',
    'why.r3.t': 'Available now.',
    'why.r3.b': 'A first conversation this week, and a fast start.',
    'why.r4.t': 'High standards as the default.',
    'why.r4.b':
      'Trained in automotive, banking, finance and logistics — where mistakes are expensive.',

    'blog.eyebrow': 'Blog',
    'blog.title': 'Field notes',
    'blog.all': 'All articles ↗',
    'blog.empty': 'Nothing here yet. The first article is on its way.',
    'blog.read': 'Read →',
    'blog.back': '← All articles',
    'blog.index.lede': 'What we learn while building, written without the gloss.',

    'contact.eyebrow': "Let's talk",
    'contact.title': 'A project, or a question?',
    'contact.lede':
      'Tell us about your situation — legacy, migration, data, AI. A founder replies within 24 hours.',
    'contact.name': 'Name *',
    'contact.email': 'Email *',
    'contact.company': 'Company',
    'contact.message': 'Message *',
    'contact.send': 'Send →',
    'contact.sending': 'Sending…',
    'contact.okTitle': 'Got it.',
    'contact.okBody': 'A founder will come back to you within 24 hours.',
    'contact.again': '← Send another message',
    'contact.error': 'Something went wrong — try again, or reach us directly on LinkedIn.',

    'footer.rights': 'Software & data engineering — Marseille',
  },
}
