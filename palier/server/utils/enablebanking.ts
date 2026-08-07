import { createSign } from 'node:crypto'

const BASE_URL = 'https://api.enablebanking.com'
// Enable Banking authenticates every call with an app-level JWT (RS256,
// signed by the private key registered against the Control Panel's
// application_id/"kid") — there's no separate per-user bearer token like
// Bridge; consent is scoped by which account uids a session grants access
// to, not by a different auth header. Max allowed exp is 24h per their
// docs; 1h here is plenty and keeps a leaked token short-lived.
const JWT_TTL_SECONDS = 60 * 60

export interface EnableBankingAppCredentials {
  applicationId: string // the "kid" — issued when you upload your cert in the Control Panel
  privateKeyPem: string
}

/** Decodes the base64'd PEM stored in .env — see .env.example for why it's base64'd. */
export function enableBankingCredentialsFromConfig(config: {
  enablebankingApplicationId: string
  enablebankingPrivateKeyB64: string
}): EnableBankingAppCredentials {
  return {
    applicationId: config.enablebankingApplicationId,
    privateKeyPem: Buffer.from(config.enablebankingPrivateKeyB64, 'base64').toString('utf8'),
  }
}

// Module-wide cache — unlike Bridge (one token per org's clientId), Enable
// Banking has exactly one app-level credential pair for the whole platform,
// so one cached JWT covers every request.
let cachedJwt: { token: string; expiresAt: number } | null = null

function getAppJwt({ applicationId, privateKeyPem }: EnableBankingAppCredentials): string {
  if (cachedJwt && cachedJwt.expiresAt > Date.now() + 60_000) {
    return cachedJwt.token
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { typ: 'JWT', alg: 'RS256', kid: applicationId }
  const payload = { iss: 'enablebanking.com', aud: 'api.enablebanking.com', iat: now, exp: now + JWT_TTL_SECONDS }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem)
  const token = `${signingInput}.${signature.toString('base64url')}`

  cachedJwt = { token, expiresAt: (now + JWT_TTL_SECONDS) * 1000 }
  return token
}

export interface EnableBankingAspsp {
  name: string
  country: string
  bic?: string
  logo?: string
  // Some banks require PSU-Ip-Address/-User-Agent/etc. on /auth and/or
  // account calls — check this before assuming startAuthorization's psu*
  // opts are optional for a given bank. See PsuHeaders below.
  required_psu_headers?: string[]
  maximum_consent_validity?: number // seconds — startAuthorization's validUntil may get capped to this
  [key: string]: unknown
}

export interface EnableBankingAccount {
  uid: string
  account_id: Record<string, string> // e.g. { iban: 'FR...' }
  all_account_ids?: { identification: string; scheme_name: string }[]
  name?: string
  currency: string
  [key: string]: unknown
}

export interface EnableBankingTransaction {
  transaction_id?: string
  entry_reference?: string
  booking_date: string
  value_date?: string
  transaction_date?: string
  transaction_amount: { currency: string; amount: string }
  // Confirmed 2026-08-07 against enablebanking.com/docs: amount above is
  // UNSIGNED, this indicator carries the direction — 'CRDT' = money in.
  // Kept as `string` rather than a narrow union: the debit literal wasn't
  // confirmed exactly ('DBIT' per ISO 20022, docs excerpt rendered it
  // oddly) — see the "else" branch in reconcile.ts, which only special-
  // cases 'CRDT' and treats anything else as debit, so this is robust
  // either way.
  credit_debit_indicator?: string
  balance_after_transaction?: { currency: string; amount: string }
  creditor?: { name?: string }
  debtor?: { name?: string }
  remittance_information?: string[]
  status: string
  [key: string]: unknown
}

/** Forwarded from the end-user's request when a bank requires them (see EnableBankingAspsp.required_psu_headers). */
export interface EnableBankingPsuHeaders {
  ipAddress?: string
  userAgent?: string
}

function psuHeaders(psu?: EnableBankingPsuHeaders) {
  return {
    ...(psu?.ipAddress ? { 'Psu-Ip-Address': psu.ipAddress } : {}),
    ...(psu?.userAgent ? { 'Psu-User-Agent': psu.userAgent } : {}),
  }
}

/**
 * Thin client for api.enablebanking.com (AIS / account information only —
 * this app never needs PIS/payment initiation). Endpoints/flow verified
 * against https://enablebanking.com/docs/api/reference/ on 2026-08-07,
 * including the exact /sessions and /transactions field names. Still not
 * yet exercised through a real redirect+SCA round-trip against a live
 * bank — see scripts/probe-enablebanking.mjs for the app-auth-only part
 * (GET /aspsps) that CAN be verified standalone.
 */
export function createEnableBankingClient(appCredentials: EnableBankingAppCredentials) {
  function authHeaders() {
    return { Authorization: `Bearer ${getAppJwt(appCredentials)}`, 'Content-Type': 'application/json' }
  }

  async function listAspsps(country?: string) {
    return $fetch<{ aspsps: EnableBankingAspsp[] }>('/aspsps', {
      baseURL: BASE_URL,
      method: 'GET',
      headers: authHeaders(),
      query: country ? { country } : undefined,
    })
  }

  /** Kicks off the redirect/consent flow; returns the hosted URL to send the landlord to. */
  async function startAuthorization(opts: {
    aspspName: string
    aspspCountry: string
    redirectUrl: string
    state: string
    validUntil: string // ISO datetime — banks may cap this shorter than requested
    psuType?: 'personal' | 'business'
    psu?: EnableBankingPsuHeaders // only some banks require these — see EnableBankingAspsp.required_psu_headers
  }) {
    return $fetch<{ url: string; authorization_id: string; psu_id_hash: string }>('/auth', {
      baseURL: BASE_URL,
      method: 'POST',
      headers: { ...authHeaders(), ...psuHeaders(opts.psu) },
      body: {
        aspsp: { name: opts.aspspName, country: opts.aspspCountry },
        access: { valid_until: opts.validUntil },
        state: opts.state,
        redirect_url: opts.redirectUrl,
        psu_type: opts.psuType ?? 'personal',
      },
    })
  }

  /** Exchanges the one-time `code` from the redirect for a session + the linked account uids. */
  async function exchangeCode(code: string) {
    return $fetch<{
      session_id: string
      accounts: EnableBankingAccount[]
      aspsp: { name: string; country: string }
      access: { valid_until: string }
    }>('/sessions', {
      baseURL: BASE_URL,
      method: 'POST',
      headers: authHeaders(),
      body: { code },
    })
  }

  async function listTransactions(
    accountUid: string,
    params: { dateFrom?: string; dateTo?: string; continuationKey?: string; psu?: EnableBankingPsuHeaders } = {},
  ) {
    return $fetch<{ transactions: EnableBankingTransaction[]; continuation_key?: string }>(
      `/accounts/${accountUid}/transactions`,
      {
        baseURL: BASE_URL,
        method: 'GET',
        headers: { ...authHeaders(), ...psuHeaders(params.psu) },
        query: {
          date_from: params.dateFrom,
          date_to: params.dateTo,
          continuation_key: params.continuationKey,
        },
      },
    )
  }

  return { listAspsps, startAuthorization, exchangeCode, listTransactions }
}
