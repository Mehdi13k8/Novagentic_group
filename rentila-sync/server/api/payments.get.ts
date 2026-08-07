import { requireOrgForUser } from '../utils/org'
import { Payment } from '../models/Payment'
import '../models/Property'
import '../models/Tenant'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  const payments = await Payment.find({ orgId: org._id })
    .sort({ dueDate: -1 })
    .limit(200)
    .populate('propertyId', 'title')
    .populate('tenantId', 'fullName')
    .lean()

  return {
    items: payments.map((p) => ({
      id: p._id.toString(),
      kind: p.kind,
      property: (p.propertyId as unknown as { title?: string })?.title ?? null,
      // Expenses genuinely have no tenant in Rentila's data — null here means
      // "not applicable", not "failed to resolve" (see rentilaSync.ts).
      tenant: (p.tenantId as unknown as { fullName?: string })?.fullName ?? null,
      personLabel: p.personLabel,
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate,
      matched: Boolean(p.matchedTransactionId),
    })),
  }
})
