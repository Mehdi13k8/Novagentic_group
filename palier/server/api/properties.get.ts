import { requireOrgForUser } from '../utils/org'
import { Property } from '../models/Property'
import { Lease } from '../models/Lease'
import { Payment } from '../models/Payment'
import '../models/Tenant'

interface PopulatedTenant {
  fullName?: string
}

/** Backs the Biens screen: one card per lot, with its live rent status. */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [properties, leases, monthRents] = await Promise.all([
    Property.find({ orgId: org._id }).sort({ title: 1 }).lean(),
    Lease.find({
      orgId: org._id,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
    })
      .populate('tenantIds', 'fullName')
      .lean(),
    Payment.find({
      orgId: org._id,
      kind: 'rent',
      dueDate: { $gte: monthStart, $lt: nextMonthStart },
    }).lean(),
  ])

  const leaseByProperty = new Map(leases.map((l) => [String(l.propertyId), l]))
  const rentByProperty = new Map(monthRents.map((p) => [String(p.propertyId), p]))

  return {
    items: properties.map((property) => {
      const id = String(property._id)
      const lease = leaseByProperty.get(id)
      const rent = rentByProperty.get(id)

      // Four states, and each is derivable — no lease means vacant, and a
      // due-and-unsettled rent means late. "À jour" is only claimed when the
      // money is actually in.
      let status: 'vacant' | 'collected' | 'late' | 'pending' = 'vacant'
      let daysLate = 0
      if (lease) {
        const settled = rent ? rent.status === 'paid' || Boolean(rent.matchedTransactionId) : false
        if (settled) status = 'collected'
        else if (rent && new Date(rent.dueDate) < now) {
          status = 'late'
          daysLate = Math.max(0, Math.floor((now.getTime() - new Date(rent.dueDate).getTime()) / 86_400_000))
        } else status = 'pending'
      }

      const tenants = ((lease?.tenantIds ?? []) as unknown as PopulatedTenant[])
        .map((t) => t?.fullName)
        .filter((n): n is string => Boolean(n))

      return {
        id,
        title: property.title,
        city: property.city ?? null,
        // The lease is the contractual figure; Property.rent is Rentila's
        // asking rent and is only a fallback for a lot with no active lease.
        rent: lease?.monthlyAmount ?? property.rent ?? null,
        hasLease: Boolean(lease),
        tenants,
        status,
        daysLate,
        leaseStart: lease?.startDate ?? null,
      }
    }),
  }
})
