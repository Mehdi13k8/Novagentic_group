import { createRentilaClient } from '../../utils/rentila'
import { encryptSecret } from '../../utils/crypto'
import { requireOrgForUser } from '../../utils/org'
import { syncOrgRentilaData } from '../../utils/rentilaSync'

interface Body {
  clientId?: string
  clientSecret?: string
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (org.plan === 'canceled') {
    throw createError({ statusCode: 402, statusMessage: 'Subscription required' })
  }

  const { clientId, clientSecret } = await readBody<Body>(event)
  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 400, statusMessage: 'clientId and clientSecret are required' })
  }

  // Validate by actually calling Rentila before storing anything — fail
  // loudly here rather than silently storing dead credentials that only
  // surface as an error on the next background sync.
  const client = createRentilaClient({ clientId, clientSecret })
  let landlordId: number | undefined
  try {
    const { items } = await client.listProperties()
    landlordId = items[0]?.LandlordID
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Could not authenticate with Rentila — check the client ID/secret' })
  }

  org.rentila.clientId = clientId
  org.rentila.encryptedClientSecret = encryptSecret(clientSecret)
  org.rentila.landlordId = landlordId
  await org.save()

  // Best-effort initial pull — don't fail the connect request if this part
  // has a hiccup, the scheduled sweep will pick it up too.
  const synced = await syncOrgRentilaData(org).catch(() => null)

  return { ok: true, landlordId: landlordId ?? null, synced }
})
