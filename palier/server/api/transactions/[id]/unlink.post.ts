import { Types } from 'mongoose'
import { requireOrgForUser } from '../../../utils/org'
import { unlinkTransaction } from '../../../utils/reconcile'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const id = getRouterParam(event, 'id')

  if (!id || !Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }

  const ok = await unlinkTransaction(org._id, new Types.ObjectId(id))
  if (!ok) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction is not currently matched' })
  }

  return { ok: true }
})
