#!/usr/bin/env node
// Ad-hoc checker for the two parts of the Enable Banking flow that CAN be
// verified standalone, without a browser round-trip through a real bank's
// SCA: (1) app-level JWT auth (GET /aspsps), always run; (2) optionally,
// whether POST /auth itself accepts a given bank + redirect_url — pass
// both as argv to test that too, e.g.:
//   npm run probe:enablebanking -- "Caisse d'Epargne Provence Alpes Corse" http://localhost:3000/api/enablebanking/callback
// This does NOT complete a connection (nobody visits the returned url) —
// it only proves /auth itself accepts the aspsp name + redirect_url before
// you click through the real UI, which is the two things most likely to
// be wrong on a first attempt (bank name string mismatch, or redirect_url
// not in the app's registered Redirect URLs list in the Control Panel).
//
// Run with: npm run probe:enablebanking (reads NUXT_ENABLEBANKING_* from
// .env via --env-file, see .env.example).
//
// Plain Node, not routed through server/utils/enablebanking.ts — that file
// uses Nuxt's `$fetch` auto-import, which doesn't exist outside a Nuxt
// context (same reason probe-rentila.mjs re-implements its own fetch calls
// instead of importing server/utils/rentila.ts).

import { createSign } from 'node:crypto'

const BASE_URL = 'https://api.enablebanking.com'

const applicationId = process.env.NUXT_ENABLEBANKING_APPLICATION_ID
const privateKeyB64 = process.env.NUXT_ENABLEBANKING_PRIVATE_KEY_B64
if (!applicationId || !privateKeyB64 || applicationId.startsWith('<') || privateKeyB64.startsWith('<')) {
  console.error('Set NUXT_ENABLEBANKING_APPLICATION_ID and NUXT_ENABLEBANKING_PRIVATE_KEY_B64 in .env first.')
  process.exit(1)
}
const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf8')

function signJwt() {
  const now = Math.floor(Date.now() / 1000)
  const header = { typ: 'JWT', alg: 'RS256', kid: applicationId }
  const payload = { iss: 'enablebanking.com', aud: 'api.enablebanking.com', iat: now, exp: now + 3600 }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem)
  return `${signingInput}.${signature.toString('base64url')}`
}

const token = signJwt()
console.log('JWT signed locally. Calling GET /aspsps?country=FR...\n')

const res = await fetch(`${BASE_URL}/aspsps?country=FR`, {
  headers: { Authorization: `Bearer ${token}` },
})

if (!res.ok) {
  console.error(`FAILED: ${res.status} ${res.statusText}`)
  console.error(await res.text())
  console.error(
    '\nIf this is 401: double-check application_id matches the cert you actually uploaded, and that ' +
      'the base64 decodes back to the exact private.key file (no extra newline/whitespace mangling).',
  )
  process.exit(1)
}

const { aspsps } = await res.json()
console.log(`OK — app-level auth works. ${aspsps.length} French ASPSPs returned.\n`)

const matches = aspsps.filter((a) => /caisse|epargne|bpce/i.test(a.name))
console.log('Matches for "Caisse d\'Epargne" / BPCE:')
for (const a of matches) {
  console.log(`  - ${a.name}${a.required_psu_headers?.length ? ` (requires PSU headers: ${a.required_psu_headers.join(', ')})` : ''}`)
}
if (matches.length === 0) {
  console.log('  (none — search aspsps.map(a => a.name) yourself, naming may differ from what the app assumed)')
}

const [aspspName, redirectUrl] = process.argv.slice(2)
if (aspspName && redirectUrl) {
  const aspsp = aspsps.find((a) => a.name === aspspName)
  if (!aspsp) {
    console.error(`\nNo ASPSP named exactly "${aspspName}" in the /aspsps list above — copy the name exactly.`)
    process.exit(1)
  }

  console.log(`\nCalling POST /auth for "${aspspName}" with redirect_url=${redirectUrl}...`)
  const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString()
  const authRes = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aspsp: { name: aspsp.name, country: aspsp.country },
      access: { valid_until: validUntil },
      state: 'probe-script',
      redirect_url: redirectUrl,
      psu_type: 'personal',
    }),
  })

  if (!authRes.ok) {
    console.error(`FAILED: ${authRes.status} ${authRes.statusText}`)
    console.error(await authRes.text())
    console.error(
      '\nIf this mentions redirect_url/redirect URI: add the exact URL above to this application\'s ' +
        '"Redirect URLs" list in the Enable Banking Control Panel — it\'s currently only registered for ' +
        'whatever was entered at signup.',
    )
    process.exit(1)
  }

  const authBody = await authRes.json()
  console.log('OK — /auth accepted the bank + redirect_url. Hosted login URL (not visited by this script):')
  console.log(`  ${authBody.url}`)
}
