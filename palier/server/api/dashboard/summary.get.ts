import { requireOrgForUser } from '../../utils/org'
import { Payment } from '../../models/Payment'
import { BankTransaction } from '../../models/BankTransaction'
import { Property } from '../../models/Property'
import { Lease } from '../../models/Lease'
import '../../models/Tenant'

const COLLECTION_MONTHS = 6

/** A rent payment counts as collected once Rentila says paid, or once we matched it locally. */
function isCollected(p: { status: string; matchedTransactionId?: unknown }) {
  return p.status === 'paid' || Boolean(p.matchedTransactionId)
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/**
 * Everything the Vue d'ensemble screen needs, in one round trip: the six KPIs,
 * the six-month collection bars, and the "À traiter" queue.
 *
 * The KPIs deliberately answer "what do I have to do today?" rather than
 * restating connection status — the previous dashboard showed three
 * connection tiles and no figures at all.
 */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const now = new Date()
  const monthStart = startOfMonth(now)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const collectionsSince = startOfMonth(new Date(now.getFullYear(), now.getMonth() - (COLLECTION_MONTHS - 1), 1))

  const [monthPayments, overduePayments, unmatchedTx, properties, leases, collectionRows] = await Promise.all([
    Payment.find({ orgId: org._id, dueDate: { $gte: monthStart, $lt: nextMonthStart } })
      .populate('propertyId', 'title')
      .populate('tenantId', 'fullName')
      .lean(),
    // Rent that was due before today and still isn't settled — the impayés KPI
    // and half of the "À traiter" queue.
    Payment.find({
      orgId: org._id,
      kind: 'rent',
      dueDate: { $lt: now },
      status: { $in: ['pending', 'partial', 'lost'] },
      matchedTransactionId: { $exists: false },
    })
      .sort({ dueDate: 1 })
      .limit(50)
      .populate('propertyId', 'title')
      .populate('tenantId', 'fullName')
      .lean(),
    BankTransaction.find({
      orgId: org._id,
      amount: { $gt: 0 },
      provider: { $in: ['bridge', 'enablebanking'] },
      matchedPaymentId: { $exists: false },
    })
      .sort({ date: -1 })
      .limit(50)
      .lean(),
    Property.find({ orgId: org._id }).select('title').lean(),
    Lease.find({
      orgId: org._id,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
    })
      .select('propertyId monthlyAmount')
      .lean(),
    Payment.aggregate<{ _id: { year: number; month: number }; collected: number }>([
      { $match: { orgId: org._id, kind: 'rent', dueDate: { $gte: collectionsSince } } },
      {
        $addFields: {
          isCollected: { $or: [{ $eq: ['$status', 'paid'] }, { $ifNull: ['$matchedTransactionId', false] }] },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' } },
          collected: { $sum: { $cond: ['$isCollected', '$amount', 0] } },
        },
      },
    ]),
  ])

  const rentThisMonth = monthPayments.filter((p) => p.kind === 'rent')
  const expensesThisMonth = monthPayments.filter((p) => p.kind === 'expense')

  const expected = rentThisMonth.reduce((sum, p) => sum + p.amount, 0)
  const collected = rentThisMonth.filter(isCollected).reduce((sum, p) => sum + p.amount, 0)
  const costs = expensesThisMonth.reduce((sum, p) => sum + p.amount, 0)

  // Occupancy is per property, not per lease: co-tenancy means several leases
  // can point at one property, and that must not read as 2/1 occupied.
  const occupiedPropertyIds = new Set(leases.map((l) => String(l.propertyId)))
  const overduePropertyIds = new Set(overduePayments.map((p) => String(p.propertyId)))

  // Fill every month in the window so the bars never show a gap-shaped hole.
  const byKey = new Map(collectionRows.map((r) => [`${r._id.year}-${r._id.month}`, r.collected]))
  const collections: { month: string; collected: number }[] = []
  const cursor = new Date(collectionsSince)
  for (let i = 0; i < COLLECTION_MONTHS; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`
    collections.push({
      month: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
      collected: byKey.get(key) ?? 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const label = (p: { propertyId?: { title?: string }; tenantId?: { fullName?: string }; personLabel: string }) =>
    p.tenantId?.fullName ?? p.personLabel

  const daysLate = (due: Date) => Math.max(0, Math.floor((now.getTime() - new Date(due).getTime()) / 86_400_000))

  // The queue mixes both kinds of pending decision, most urgent first: money
  // that arrived and needs placing, and rent that never arrived.
  const todos = [
    ...overduePayments.slice(0, 6).map((p) => ({
      kind: 'overdue' as const,
      id: String(p._id),
      tenant: label(p as never),
      property: (p.propertyId as unknown as { title?: string })?.title ?? null,
      amount: p.amount,
      dueDate: p.dueDate,
      daysLate: daysLate(p.dueDate),
    })),
    ...unmatchedTx.slice(0, 6).map((tx) => ({
      kind: 'unmatched' as const,
      id: String(tx._id),
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
    })),
  ]

  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    collected,
    expected,
    costs,
    net: collected - costs,
    toReconcile: unmatchedTx.length,
    overdue: {
      properties: overduePropertyIds.size,
      amount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
      worst: overduePayments[0]
        ? {
            tenant: label(overduePayments[0] as never),
            property: (overduePayments[0].propertyId as unknown as { title?: string })?.title ?? null,
            daysLate: daysLate(overduePayments[0].dueDate),
          }
        : null,
    },
    occupancy: { occupied: occupiedPropertyIds.size, total: properties.length },
    expectedMonthly: leases.reduce((sum, l) => sum + l.monthlyAmount, 0),
    collections,
    todos,
  }
})
