import { Types } from 'mongoose'
import { requireOrgForUser } from '../../../utils/org'
import { manualLinkTransaction } from '../../../utils/reconcile'

interface Body {
  paymentId?: string
}

const REASON_MESSAGES: Record<string, string> = {
  'transaction-not-found': 'Transaction not found',
  'payment-not-found': 'Payment not found',
  'already-matched': 'One side of this link is already matched to something else — refresh and try again',
  'race-lost': 'Someone/something else claimed one side of this link a moment ago — refresh and try again',
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const id = getRouterParam(event, 'id')
  const { paymentId } = await readBody<Body>(event)

  if (!id || !Types.ObjectId.isValid(id) || !paymentId || !Types.ObjectId.isValid(paymentId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction or payment id' })
  }

  const result = await manualLinkTransaction(org._id, new Types.ObjectId(id), new Types.ObjectId(paymentId))
  if (!result.ok) {
    throw createError({
      statusCode: 409,
      statusMessage: REASON_MESSAGES[result.reason ?? ''] ?? 'Could not link',
    })
  }

  return { ok: true }
})
