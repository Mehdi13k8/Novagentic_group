import { requireOrgForUser } from '../utils/org'
import { Tenant } from '../models/Tenant'
import { Lease } from '../models/Lease'
import { Payment } from '../models/Payment'
import '../models/Property'

interface PopulatedProperty {
  title?: string
}

/** Backs the Locataires screen: who lives where, and where this month's rent stands. */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [tenants, leases, monthRents] = await Promise.all([
    Tenant.find({ orgId: org._id }).sort({ fullName: 1 }).lean(),
    Lease.find({
      orgId: org._id,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
    })
      .populate('propertyId', 'title')
      .lean(),
    Payment.find({
      orgId: org._id,
      kind: 'rent',
      dueDate: { $gte: monthStart, $lt: nextMonthStart },
    }).lean(),
  ])

  // A lease carries an array of tenants (co-tenancy is real in Rentila's
  // data), so index by every tenant on it rather than assuming one each.
  const leaseByTenant = new Map<string, (typeof leases)[number]>()
  for (const lease of leases) {
    for (const tenantId of lease.tenantIds ?? []) leaseByTenant.set(String(tenantId), lease)
  }
  const rentByProperty = new Map(monthRents.map((p) => [String(p.propertyId), p]))

  return {
    items: tenants
      .map((tenant) => {
        const lease = leaseByTenant.get(String(tenant._id))
        const rent = lease ? rentByProperty.get(String(lease.propertyId)) : undefined

        let status: 'collected' | 'late' | 'pending' | 'noLease' = 'noLease'
        let daysLate = 0
        if (lease) {
          const settled = rent ? rent.status === 'paid' || Boolean(rent.matchedTransactionId) : false
          if (settled) status = 'collected'
          else if (rent && new Date(rent.dueDate) < now) {
            status = 'late'
            daysLate = Math.max(0, Math.floor((now.getTime() - new Date(rent.dueDate).getTime()) / 86_400_000))
          } else status = 'pending'
        }

        return {
          id: String(tenant._id),
          name: tenant.fullName,
          property: lease ? ((lease.propertyId as unknown as PopulatedProperty)?.title ?? null) : null,
          rent: lease?.monthlyAmount ?? null,
          since: lease?.startDate ?? null,
          status,
          daysLate,
        }
      })
      // A former tenant with no active lease isn't part of "who owes what
      // this month" — keep the screen about the current picture.
      .filter((t) => t.status !== 'noLease'),
  }
})
