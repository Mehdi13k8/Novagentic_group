import type { HydratedDocument, Types } from 'mongoose'
import { createRentilaClient, type RentilaPayment } from './rentila'
import { decryptSecret } from './crypto'
import { Property } from '../models/Property'
import { Tenant } from '../models/Tenant'
import { Lease } from '../models/Lease'
import { Payment, type PaymentDoc } from '../models/Payment'
import type { OrganizationDoc } from '../models/Organization'

function mapPaymentStatus(status: RentilaPayment['PaymentStatus']): PaymentDoc['status'] {
  // Confirmed live: 0 = pending, 2 = paid. -1 ("Perdu"/lost) and "partial"
  // were seen only in the app's UI dropdown, not yet in a live payload —
  // treat anything unrecognized as 'partial' rather than silently mis-
  // classifying it as paid or pending.
  if (status === 2) return 'paid'
  if (status === 0) return 'pending'
  if (status === -1) return 'lost'
  return 'partial'
}

/**
 * Pulls properties/tenants/leases/payments for one org from Rentila and
 * upserts them into the `rent_sync` cache — this is what gives the
 * reconciliation engine (server/utils/reconcile.ts) something to match
 * bank transactions against. Read-only against Rentila (see rentila.ts);
 * this is the ingest direction, never a write-back.
 */
export async function syncOrgRentilaData(org: HydratedDocument<OrganizationDoc>) {
  const client = createRentilaClient({
    clientId: org.rentila.clientId,
    clientSecret: decryptSecret(org.rentila.encryptedClientSecret),
  })

  const propertyIdMap = new Map<number, Types.ObjectId>()
  const { items: properties } = await client.listProperties()
  for (const p of properties) {
    const doc = await Property.findOneAndUpdate(
      { orgId: org._id, rentilaId: p.Id },
      { $set: { title: p.PropertyTitle, city: p.PropertyCity, rent: Number(p.PropertyRent), raw: p } },
      { upsert: true, new: true },
    )
    propertyIdMap.set(p.Id, doc._id)
  }

  const tenantIdMap = new Map<number, Types.ObjectId>()
  const { items: tenants } = await client.listTenants()
  for (const t of tenants) {
    const fullName = t.Label ?? [t.TenantFirstName, t.TenantLastName].filter(Boolean).join(' ')
    const doc = await Tenant.findOneAndUpdate(
      { orgId: org._id, rentilaId: t.Id },
      { $set: { firstName: t.TenantFirstName, lastName: t.TenantLastName, fullName, raw: t } },
      { upsert: true, new: true },
    )
    tenantIdMap.set(t.Id, doc._id)
  }

  const leaseIdMap = new Map<number, Types.ObjectId>()
  const { items: leases } = await client.listLeases()
  for (const l of leases) {
    const propertyId = propertyIdMap.get(l.PropertyID as number)
    if (!propertyId) continue // property not synced (shouldn't happen, but don't crash the whole sync over one bad row)

    const leaseTenants = (l.Tenants as Array<{ Id: number }> | undefined) ?? []
    const tenantIds = leaseTenants.map((t) => tenantIdMap.get(t.Id)).filter((id): id is Types.ObjectId => Boolean(id))

    const doc = await Lease.findOneAndUpdate(
      { orgId: org._id, rentilaId: l.Id },
      {
        $set: {
          propertyId,
          tenantIds,
          startDate: new Date(l.LeaseStartDate),
          endDate: l.LeaseEndDate ? new Date(l.LeaseEndDate) : undefined,
          monthlyAmount: Number(l.LeaseMonthlyAmount),
          raw: l,
        },
      },
      { upsert: true, new: true },
    )
    leaseIdMap.set(l.Id, doc._id)
  }

  const { items: payments } = await client.listPayments()
  for (const p of payments) {
    const propertyId = propertyIdMap.get(p.PropertyID)
    const leaseId = leaseIdMap.get(p.LeaseID)
    const tenantId = tenantIdMap.get(p.TenantID)
    // Expenses (ENGIE, syndic, taxes...) don't carry a real tenant/lease in
    // Rentila's data — only rent payments do. Skip rows we can't fully
    // resolve rather than writing a half-populated Payment doc; the
    // reconciliation engine only ever looks at kind: 'rent' anyway.
    if (p.PaymentType !== 'rent' || !propertyId || !leaseId || !tenantId) continue

    // NOTE (known rough edge): `status`/`amountPaid`/`amountLeft` here
    // mirror Rentila's own record, which stays 'pending' until the landlord
    // manually confirms it there — the write-back path doesn't exist yet
    // (Phase 0 findings). A payment already reconciled locally by the
    // matching engine keeps `matchedTransactionId` set (that's the actual
    // safety-relevant signal, and this $set never touches it), but this
    // periodic resync will keep showing Rentila's stale 'pending' on top of
    // it until either a write-back path ships or the landlord clicks paid
    // in Rentila themselves. Revisit once Phase 0's write question is
    // resolved via the MCP connector.
    await Payment.findOneAndUpdate(
      { orgId: org._id, rentilaId: p.Id },
      {
        $set: {
          propertyId,
          leaseId,
          tenantId,
          kind: 'rent',
          amount: Number(p.PaymentAmount),
          amountPaid: p.PaymentAmountPaid,
          amountLeft: p.PaymentAmountLeft,
          status: mapPaymentStatus(p.PaymentStatus),
          dueDate: new Date(p.PaymentDate),
          personLabel: p.PaymentPerson,
          raw: p,
        },
      },
      { upsert: true, new: true },
    )
  }

  return {
    properties: properties.length,
    tenants: tenants.length,
    leases: leases.length,
    payments: payments.length,
  }
}
