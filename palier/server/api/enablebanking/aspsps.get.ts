import { createEnableBankingClient, enableBankingCredentialsFromConfig } from '../../utils/enablebanking'

/** Bank picker for the Connect form — just needs to be logged in, not org-scoped. */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const query = getQuery(event)
  const country = typeof query.country === 'string' ? query.country : 'FR'

  const config = useRuntimeConfig()
  const client = createEnableBankingClient(enableBankingCredentialsFromConfig(config))
  const { aspsps } = await client.listAspsps(country)

  return { aspsps: aspsps.map((a) => ({ name: a.name, country: a.country })) }
})
