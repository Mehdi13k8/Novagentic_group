import { createHash, timingSafeEqual } from 'node:crypto'
import { User } from '../../models/User'

interface Body {
  email?: string
  token?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const { email: rawEmail, token, password } = await readBody<Body>(event)
  const email = rawEmail?.trim().toLowerCase()
  if (!email || !token || !password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'email, token, and a password (8+ chars) are required' })
  }

  const user = await User.findOne({ email })
  const genericError = () => createError({ statusCode: 400, statusMessage: 'Invalid or expired reset link' })

  if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
    throw genericError()
  }
  if (user.resetTokenExpiresAt.getTime() < Date.now()) {
    throw genericError()
  }

  const providedHash = createHash('sha256').update(token).digest('hex')
  const storedHash = user.resetTokenHash
  const valid =
    providedHash.length === storedHash.length &&
    timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(storedHash, 'hex'))
  if (!valid) {
    throw genericError()
  }

  user.passwordHash = await hashPassword(password)
  user.resetTokenHash = undefined
  user.resetTokenExpiresAt = undefined
  await user.save()

  // Log the user in directly — they just proved control of the account via
  // the emailed link, no reason to make them log in again right after.
  await setUserSession(event, { user: { id: user._id.toString(), email: user.email } })

  return { ok: true }
})
