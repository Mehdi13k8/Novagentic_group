import { EmailClient } from '@azure/communication-email'

interface ContactBody {
  name?: string
  email?: string
  company?: string
  message?: string
  website?: string // honeypot — real users never fill this
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)

  // Honeypot: bots fill every field, humans never see this one.
  if (body.website) {
    return { ok: true }
  }

  const name = body.name?.trim()
  const email = body.email?.trim()
  const company = body.company?.trim()
  const message = body.message?.trim()

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Champs manquants.' })
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })
  }

  const config = useRuntimeConfig()

  if (!config.acsConnectionString || !config.acsSenderAddress) {
    throw createError({ statusCode: 500, statusMessage: 'Envoi indisponible pour le moment.' })
  }

  const client = new EmailClient(config.acsConnectionString)

  const cc = config.contactCc
    ? config.contactCc.split(',').map(s => s.trim()).filter(Boolean).map(address => ({ address }))
    : undefined

  const poller = await client.beginSend({
    senderAddress: config.acsSenderAddress,
    content: {
      subject: `Nouveau message de ${name} — novagentic.fr`,
      plainText: [
        `Nom : ${name}`,
        `Email : ${email}`,
        company ? `Société : ${company}` : null,
        '',
        message,
      ].filter(Boolean).join('\n'),
    },
    recipients: {
      to: [{ address: config.contactTo }],
      cc,
    },
    replyTo: [{ address: email, displayName: name }],
  })

  await poller.pollUntilDone()

  return { ok: true }
})
