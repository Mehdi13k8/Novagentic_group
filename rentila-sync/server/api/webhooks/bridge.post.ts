import { verifyBridgeWebhookSignature, createBridgeClient } from '../../utils/bridge'
import { ingestBridgeTransaction } from '../../utils/reconcile'
import { Organization } from '../../models/Organization'

interface BridgeWebhookPayload {
  type: string
  content: Record<string, unknown>
  timestamp: number
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const config = useRuntimeConfig()
  const signatureHeader = getHeader(event, 'bridgeapi-signature')
  const valid = verifyBridgeWebhookSignature(rawBody, signatureHeader, config.bridgeWebhookSecret)
  if (!valid) {
    // Do not process anything on an unverified webhook — this is the only
    // thing standing between "a rent got paid" and "anyone who finds this
    // URL can fake that."
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody) as BridgeWebhookPayload

  if (payload.type === 'TEST_EVENT') {
    return { ok: true, received: 'test' }
  }

  // "New transactions available" per Bridge's event catalog — the webhook
  // itself doesn't carry the transaction data, just tells us to go fetch it.
  if (payload.type === 'item.account.updated') {
    const nbNew = Number(payload.content.nb_new_transactions ?? 0)
    if (nbNew > 0) {
      const userUuid = String(payload.content.user_uuid ?? '')
      const org = await Organization.findOne({ 'bridge.userUuid': userUuid })
      if (org) {
        const bridge = createBridgeClient({ clientId: config.bridgeClientId, clientSecret: config.bridgeClientSecret })
        const { access_token: accessToken } = await bridge.authenticateUser(userUuid)
        const { resources } = await bridge.listTransactions(accessToken, {
          accountId: Number(payload.content.account_id),
        })
        for (const tx of resources) {
          if (tx.deleted) continue
          await ingestBridgeTransaction(org._id, tx)
        }
      }
    }
  }

  return { ok: true }
})
