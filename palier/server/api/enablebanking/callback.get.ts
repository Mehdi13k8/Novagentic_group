import { Organization } from '../../models/Organization'
import { createEnableBankingClient, enableBankingCredentialsFromConfig } from '../../utils/enablebanking'
import { syncOrgEnableBankingTransactions } from '../../utils/reconcile'

/**
 * Enable Banking has no webhook for this flow (unlike Bridge) — this
 * redirect landing IS the real signal, and `code` is a one-time value we
 * must exchange server-side right here, not just a UX waypoint like
 * app/pages/dashboard/bank-callback.vue is for Bridge.
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)

  if (query.error) {
    return sendRedirect(event, '/dashboard/integrations?bank=error')
  }

  const code = typeof query.code === 'string' ? query.code : ''
  const state = typeof query.state === 'string' ? query.state : ''
  if (!code) {
    return sendRedirect(event, '/dashboard/integrations?bank=error')
  }

  const org = await Organization.findOne({ ownerUserId: session.user.id })
  if (!org) {
    return sendRedirect(event, '/dashboard/integrations?bank=error')
  }

  // Loose replay/CSRF guard — `code` itself is the real security boundary
  // (single-use, short-lived, minted by Enable Banking), this just catches
  // a stale or duplicate redirect landing here against the wrong attempt.
  if (org.enablebanking.pendingState && state && org.enablebanking.pendingState !== state) {
    return sendRedirect(event, '/dashboard/integrations?bank=error')
  }

  const config = useRuntimeConfig()
  const client = createEnableBankingClient(enableBankingCredentialsFromConfig(config))

  let result
  try {
    result = await client.exchangeCode(code)
  } catch {
    return sendRedirect(event, '/dashboard/integrations?bank=error')
  }

  org.enablebanking.sessionId = result.session_id
  org.enablebanking.accountUids = result.accounts.map((a) => a.uid)
  org.enablebanking.validUntil = new Date(result.access.valid_until)
  org.enablebanking.pendingState = undefined
  await org.save()

  // Best-effort initial pull, same "don't fail the connect on this" pattern
  // as Rentila's connect route — the scheduled sweep will pick it up too.
  //
  // 90 days, not the sweep's default 7: this is the one moment we can pull
  // history from before the consent existed, and the sweep never looks back
  // that far again. Whatever the bank caps it at is what we get.
  await syncOrgEnableBankingTransactions(org, { days: 90 }).catch(() => null)

  return sendRedirect(event, '/dashboard/integrations?bank=connected')
})
