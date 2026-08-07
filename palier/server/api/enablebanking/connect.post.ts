import { randomUUID } from 'node:crypto'
import { createEnableBankingClient, enableBankingCredentialsFromConfig } from '../../utils/enablebanking'
import { requireOrgForUser } from '../../utils/org'

interface Body {
  aspspName?: string
  aspspCountry?: string
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (org.plan === 'canceled') {
    throw createError({ statusCode: 402, statusMessage: 'Subscription required' })
  }

  const { aspspName, aspspCountry } = await readBody<Body>(event)
  if (!aspspName || !aspspCountry) {
    throw createError({ statusCode: 400, statusMessage: 'aspspName and aspspCountry are required' })
  }

  const config = useRuntimeConfig()
  const client = createEnableBankingClient(enableBankingCredentialsFromConfig(config))

  const state = randomUUID()
  // 90 days requested; the bank's own max consent duration may cap this
  // lower — access.valid_until in the /sessions response after callback is
  // the real, bank-confirmed value, not this one.
  const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString()

  const session = await client.startAuthorization({
    aspspName,
    aspspCountry,
    redirectUrl: `${config.appUrl}/api/enablebanking/callback`,
    state,
    validUntil,
    // Some ASPSPs require these (see EnableBankingAspsp.required_psu_headers
    // from /aspsps) — harmless to send unconditionally otherwise.
    psu: { ipAddress: getRequestIP(event, { xForwardedFor: true }), userAgent: getHeader(event, 'user-agent') },
  })

  org.enablebanking.pendingState = state
  org.enablebanking.aspspName = aspspName
  org.enablebanking.aspspCountry = aspspCountry
  await org.save()

  return { url: session.url }
})
