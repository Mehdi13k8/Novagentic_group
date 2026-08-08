import { requireOrgForUser } from '../utils/org'
import { Payment } from '../models/Payment'
import '../models/Property'
import '../models/Tenant'

/**
 * Backs the Grand livre screen.
 *
 * Rent is a credit, an apartment cost is a debit, and the running balance is
 * computed over the window in date order. There is deliberately no accounting
 * "account" column: Palier has no chart of accounts, and printing a plausible
 * 706/614 next to a real figure would be inventing bookkeeping the product
 * does not actually do.
 */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const query = getQuery(event)

  // ?month=YYYY-MM narrows to one month; omitted means the current one.
  const raw = typeof query.month === 'string' ? query.month : ''
  const match = /^(\d{4})-(\d{2})$/.exec(raw)
  const now = new Date()
  const year = match ? Number(match[1]) : now.getFullYear()
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth()
  const from = new Date(year, monthIndex, 1)
  const to = new Date(year, monthIndex + 1, 1)

  const payments = await Payment.find({ orgId: org._id, dueDate: { $gte: from, $lt: to } })
    .sort({ dueDate: 1 })
    .populate('propertyId', 'title')
    .populate('tenantId', 'fullName')
    .lean()

  let balance = 0
  const entries = payments.map((p) => {
    const credit = p.kind === 'rent' ? p.amount : 0
    const debit = p.kind === 'expense' ? p.amount : 0
    balance += credit - debit
    const tenant = (p.tenantId as unknown as { fullName?: string })?.fullName
    return {
      id: String(p._id),
      date: p.dueDate,
      label: tenant ? `${tenant} — ${p.personLabel}` : p.personLabel,
      property: (p.propertyId as unknown as { title?: string })?.title ?? null,
      kind: p.kind,
      status: p.status,
      // Whether this line is backed by an actual bank movement — the design's
      // "les écritures rapprochées portent la référence du virement".
      reconciled: Boolean(p.matchedTransactionId),
      debit,
      credit,
      balance,
    }
  })

  // The months that actually hold data, so the filter only ever offers real
  // options instead of a synthetic rolling window.
  const availableMonths = await Payment.aggregate<{ _id: string }>([
    { $match: { orgId: org._id } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$dueDate' } } } },
    { $sort: { _id: -1 } },
    { $limit: 36 },
  ])

  return {
    month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    entries,
    totals: {
      debit: entries.reduce((sum, e) => sum + e.debit, 0),
      credit: entries.reduce((sum, e) => sum + e.credit, 0),
      balance,
    },
    availableMonths: availableMonths.map((m) => m._id),
  }
})
