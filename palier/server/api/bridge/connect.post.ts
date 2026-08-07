import { createBridgeClient } from '../../utils/bridge'
import { requireOrgForUser } from '../../utils/org'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (org.plan === 'canceled') {
    throw createError({ statusCode: 402, statusMessage: 'Subscription required' })
  }

  const session = await requireUserSession(event)
  const config = useRuntimeConfig()
  const bridge = createBridgeClient({ clientId: config.bridgeClientId, clientSecret: config.bridgeClientSecret })

  // One Bridge "user" per org, created once and reused for every bank
  // connection this org makes (CEPAC now, maybe another account later).
  let userUuid = org.bridge.userUuid
  if (!userUuid) {
    const bridgeUser = await bridge.createUser(org._id.toString())
    userUuid = bridgeUser.uuid
    org.bridge.userUuid = userUuid
    await org.save()
  }

  const { access_token: userToken } = await bridge.authenticateUser(userUuid)
  const connectSession = await bridge.createConnectSession(userToken, {
    email: session.user.email,
    callbackUrl: `${config.appUrl}/dashboard/bank-callback`,
  })

  return { url: connectSession.url }
})
