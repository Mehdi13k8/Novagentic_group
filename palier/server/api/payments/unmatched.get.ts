import { requireOrgForUser } from '../../utils/org'
import { Payment } from '../../models/Payment'
import '../../models/Property'
import '../../models/Tenant'

/** Source list for the Virements page's "Link to payment" picker. */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  const payments = await Payment.find({
    orgId: org._id,
    kind: 'rent',
    status: { $in: ['pending', 'partial'] },
    matchedTransactionId: { $exists: false },
  })
    .sort({ dueDate: 1 })
    .limit(100)
    .populate('propertyId', 'title')
    .populate('tenantId', 'fullName')
    .lean()

  return {
    items: payments.map((p) => ({
      id: p._id.toString(),
      dueDate: p.dueDate,
      amount: p.amount,
      property: (p.propertyId as unknown as { title?: string })?.title ?? null,
      tenant: (p.tenantId as unknown as { fullName?: string })?.fullName ?? null,
    })),
  }
})
