import { User } from '../../models/User'
import { Organization } from '../../models/Organization'

interface SignupBody {
  email?: string
  password?: string
  orgName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SignupBody>(event)
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'email and a password (8+ chars) are required' })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    // Same message as "wrong password" would give — don't leak whether an
    // email is registered.
    throw createError({ statusCode: 400, statusMessage: 'Could not create account' })
  }

  const passwordHash = await hashPassword(password)
  const user = await User.create({ email, passwordHash })

  // MVP: one org per user, created automatically at signup. Revisit if
  // "invite teammates to the same org" ever becomes a requirement.
  const org = await Organization.create({
    name: body.orgName?.trim() || `${email}'s organization`,
    ownerUserId: user._id,
    plan: 'trial',
  })

  await setUserSession(event, {
    user: { id: user._id.toString(), email: user.email },
  })

  return { ok: true, orgId: org._id.toString() }
})
