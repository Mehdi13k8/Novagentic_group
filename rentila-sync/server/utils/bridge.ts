import { createHmac, timingSafeEqual } from 'node:crypto'

const BASE_URL = 'https://api.bridgeapi.io/v3'
// Bridge date-versions its API and can sunset old pins — re-check this
// against https://docs.bridgeapi.io before it's been sitting for a while.
const BRIDGE_VERSION = '2025-01-15'

export interface BridgeAppCredentials {
  clientId: string
  clientSecret: string
}

function appHeaders({ clientId, clientSecret }: BridgeAppCredentials) {
  return {
    'Client-Id': clientId,
    'Client-Secret': clientSecret,
    'Bridge-Version': BRIDGE_VERSION,
    'Content-Type': 'application/json',
  }
}

export interface BridgeTransaction {
  id: number
  account_id: number
  amount: number
  currency_code: string
  date: string
  clean_description: string
  provider_description: string
  updated_at: string
  deleted: boolean
  [key: string]: unknown
}

/**
 * Bridge's model is the INVERSE of Rentila's: ONE app registration here
 * (BRIDGE_CLIENT_ID/SECRET, platform-wide env vars) with MANY end-user
 * accounts underneath it — one Bridge "user" per landlord org, created once
 * and stored as Organization.bridge.userUuid. Every landlord does NOT bring
 * their own Bridge app credentials.
 *
 * Endpoints/headers verified against https://docs.bridgeapi.io on
 * 2026-08-07 (v3, Bridge-Version 2025-01-15) — actual sandbox responses
 * haven't been exercised yet (no network probing was done here, unlike
 * Rentila's client); confirm the exact response shapes the first time this
 * runs against the sandbox keys.
 */
export function createBridgeClient(appCredentials: BridgeAppCredentials) {
  async function createUser(externalUserId: string) {
    return $fetch<{ uuid: string; external_user_id: string }>('/aggregation/users', {
      baseURL: BASE_URL,
      method: 'POST',
      headers: appHeaders(appCredentials),
      body: { external_user_id: externalUserId },
    })
  }

  async function authenticateUser(userUuid: string) {
    return $fetch<{ access_token: string; expires_at: string; user: { uuid: string } }>(
      '/aggregation/authorization/token',
      {
        baseURL: BASE_URL,
        method: 'POST',
        headers: appHeaders(appCredentials),
        body: { user_uuid: userUuid },
      },
    )
  }

  /** Returns the hosted webview URL to redirect the landlord to for bank login (Bridge Connect). */
  async function createConnectSession(userToken: string, opts: { email: string; callbackUrl?: string }) {
    return $fetch<{ id: string; url: string }>('/aggregation/connect-sessions', {
      baseURL: BASE_URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Bridge-Version': BRIDGE_VERSION,
        'Content-Type': 'application/json',
      },
      body: {
        user_email: opts.email,
        country_code: 'FR',
        callback_url: opts.callbackUrl,
      },
    })
  }

  async function listTransactions(userToken: string, params: { since?: string; accountId?: number } = {}) {
    return $fetch<{ resources: BridgeTransaction[]; pagination: { next_uri?: string } }>(
      '/aggregation/transactions',
      {
        baseURL: BASE_URL,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Bridge-Version': BRIDGE_VERSION,
        },
        query: {
          since: params.since,
          account_id: params.accountId,
          limit: 500,
        },
      },
    )
  }

  return { createUser, authenticateUser, createConnectSession, listTransactions }
}

/**
 * Verifies a Bridge webhook signature. MUST run against the raw request
 * body string — Bridge signs the exact bytes they sent, and re-serializing
 * parsed JSON can produce different bytes (key order, whitespace) that
 * would make even a legitimate webhook fail verification.
 *
 * Header format: `BridgeApi-Signature: v1=<HEX>` (HMAC-SHA256, uppercase hex).
 */
export function verifyBridgeWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  webhookSecret: string,
): boolean {
  if (!signatureHeader) return false

  const v1 = signatureHeader
    .split(',')
    .map((s) => s.trim())
    .find((s) => s.startsWith('v1='))
    ?.slice('v1='.length)
  if (!v1) return false

  const expectedHex = createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex').toUpperCase()

  let provided: Buffer
  let expected: Buffer
  try {
    provided = Buffer.from(v1, 'hex')
    expected = Buffer.from(expectedHex, 'hex')
  } catch {
    return false
  }
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}
