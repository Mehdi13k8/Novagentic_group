#!/usr/bin/env node
// Ad-hoc "what does this endpoint actually return" checker against your own
// Rentila account. Run with: npm run probe:rentila (reads RENTILA_CLIENT_ID/
// RENTILA_CLIENT_SECRET from .env via --env-file, see .env.example).
//
// This is how Phase 0 (see the plan doc) was actually answered on
// 2026-08-07: every known resource only allows GET (405 + `Allow: GET` on
// OPTIONS for anything else) — confirmed read-only for this app token.
// Re-run this if Rentila ever changes something and you need to re-check.

const BASE_URL = 'https://api2.rentila.com'

const clientId = process.env.RENTILA_CLIENT_ID
const clientSecret = process.env.RENTILA_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('Set RENTILA_CLIENT_ID and RENTILA_CLIENT_SECRET in .env first.')
  process.exit(1)
}

async function getToken() {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  })
  if (!res.ok) throw new Error(`token request failed: ${res.status}`)
  const { access_token } = await res.json()
  return access_token
}

async function checkAllowedMethods(token, path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'OPTIONS',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.headers.get('allow') ?? `(${res.status}, no Allow header)`
}

const token = await getToken()
console.log('Token acquired.\n')

const paths = ['/landlord/properties', '/landlord/tenants', '/landlord/leases', '/landlord/payments']
for (const path of paths) {
  const allow = await checkAllowedMethods(token, path)
  console.log(`OPTIONS ${path} -> Allow: ${allow}`)
}
