import { requireOrgForUser } from '../../utils/org'
import { Payment } from '../../models/Payment'

const MONTHS_BACK = 12

/**
 * Monthly income (rent actually received — 'paid' in Rentila OR matched to
 * a bank transaction locally, not just due) vs expenses (every 'expense'-
 * kind Payment, per server/utils/rentilaSync.ts) for the last 12 months,
 * grouped by dueDate. Backs the Accounting page's chart.
 */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  const since = new Date()
  since.setMonth(since.getMonth() - (MONTHS_BACK - 1))
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const rows = await Payment.aggregate<{ _id: { year: number; month: number }; income: number; expenses: number }>([
    { $match: { orgId: org._id, dueDate: { $gte: since } } },
    {
      $addFields: {
        isRealizedIncome: {
          $and: [{ $eq: ['$kind', 'rent'] }, { $or: [{ $eq: ['$status', 'paid'] }, { $ifNull: ['$matchedTransactionId', false] }] }],
        },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' } },
        income: { $sum: { $cond: ['$isRealizedIncome', '$amount', 0] } },
        expenses: { $sum: { $cond: [{ $eq: ['$kind', 'expense'] }, '$amount', 0] } },
      },
    },
  ])

  // Fill every month in the window (even ones with no data) so the chart
  // always shows a full, gap-free 12-month span.
  const byKey = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r]))
  const months: { month: string; income: number; expenses: number }[] = []
  const cursor = new Date(since)
  for (let i = 0; i < MONTHS_BACK; i++) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth() + 1
    const row = byKey.get(`${year}-${month}`)
    months.push({
      month: `${year}-${String(month).padStart(2, '0')}`,
      income: row?.income ?? 0,
      expenses: row?.expenses ?? 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0)

  return { months, totalIncome, totalExpenses, net: totalIncome - totalExpenses }
})
