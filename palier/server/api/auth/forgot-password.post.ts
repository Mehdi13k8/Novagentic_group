import { randomBytes, createHash } from 'node:crypto'
import { User } from '../../models/User'

interface Body {
  email?: string
}

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export default defineEventHandler(async (event) => {
  const { email: rawEmail } = await readBody<Body>(event)
  const email = rawEmail?.trim().toLowerCase()
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const user = await User.findOne({ email })
  // Always return the same response whether or not the account exists —
  // otherwise this endpoint becomes a way to enumerate registered emails.
  if (user) {
    const rawToken = randomBytes(32).toString('hex')
    user.resetTokenHash = createHash('sha256').update(rawToken).digest('hex')
    user.resetTokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    await user.save()

    const config = useRuntimeConfig()
    const resetUrl = `${config.appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${rawToken}`

    // TODO: real email delivery (same gap as notifyLandlord() in
    // server/utils/reconcile.ts — no provider wired up yet). Logging the
    // link is enough to actually exercise the full flow locally: copy it
    // from the server console into a browser.
    // eslint-disable-next-line no-console
    console.log(`[auth] password reset requested for ${email}: ${resetUrl}`)
  }

  return { ok: true }
})
