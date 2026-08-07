import { User } from '../../models/User'

interface LoginBody {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password are required' })
  }

  const user = await User.findOne({ email })
  // Verify against a dummy hash when the user doesn't exist, so the two
  // failure paths (no such user / wrong password) take a similar amount of
  // time and don't leak which case it was via a timing side-channel.
  const hashToCheck = user?.passwordHash ?? (await hashPassword('not-a-real-password'))
  const valid = await verifyPassword(hashToCheck, password)

  if (!user || !valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: { id: user._id.toString(), email: user.email },
  })

  return { ok: true }
})
