import { requireOrgForUser } from '../../utils/org'
import { syncOrgRentilaData } from '../../utils/rentilaSync'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (!org.rentila.clientId || !org.rentila.encryptedClientSecret) {
    throw createError({ statusCode: 400, statusMessage: 'Rentila is not connected yet' })
  }

  const result = await syncOrgRentilaData(org)
  return { ok: true, ...result }
})
