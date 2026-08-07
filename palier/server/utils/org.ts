import type { H3Event } from 'h3'
import { Organization } from '../models/Organization'

/**
 * MVP: one org per user (created at signup — see server/api/auth/signup.post.ts).
 * Throws 401 if not logged in, 404 if the session's user somehow has no org.
 * Revisit if multi-org-per-user (agencies managing several landlords' orgs)
 * ever becomes a requirement.
 */
export async function requireOrgForUser(event: H3Event) {
  const session = await requireUserSession(event)
  const org = await Organization.findOne({ ownerUserId: session.user.id })
  if (!org) {
    throw createError({ statusCode: 404, statusMessage: 'No organization for this account' })
  }
  return org
}
