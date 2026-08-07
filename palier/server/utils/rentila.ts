const BASE_URL = 'https://api2.rentila.com'

export interface RentilaCredentials {
  clientId: string
  clientSecret: string
}

interface CachedToken {
  accessToken: string
  expiresAt: number // epoch ms
}

// Keyed by clientId — each org has its own credentials/token, this is a
// process-wide in-memory cache shared across all orgs' requests.
const tokenCache = new Map<string, CachedToken>()

async function getAccessToken({ clientId, clientSecret }: RentilaCredentials): Promise<string> {
  const cached = tokenCache.get(clientId)
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.accessToken
  }

  const res = await $fetch<{ access_token: string; token_type: string; expires_in: number }>('/oauth/token', {
    baseURL: BASE_URL,
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  tokenCache.set(clientId, {
    accessToken: res.access_token,
    expiresAt: Date.now() + res.expires_in * 1000,
  })
  return res.access_token
}

export interface RentilaPagination {
  page: number
  total_pages: number
  show_from: number
  show_to: number
  show_per_page: number
  records_count: number
}

// Shapes below were reverse-engineered from live responses on 2026-08-07
// (no public schema was reachable — /docs and /openapi.json 401 unless
// requested from a signed-in Rentila browser session). Treat as best-effort;
// re-verify if a field comes back missing/renamed.
export interface RentilaProperty {
  Id: number
  Label: string
  PropertyTitle: string
  PropertyAddress: string
  PropertyCity: string
  PropertyPostalCode: string
  PropertyCountry: string
  PropertyRent: string
  PropertyStatus: number
  PropertyStatusLabel: string
  LandlordID: number
  [key: string]: unknown
}

export interface RentilaTenant {
  Id: number
  Label: string
  TenantFirstName?: string
  TenantLastName?: string
  TenantCompanyName?: string
  TenantStatusLabel?: string
  [key: string]: unknown
}

export interface RentilaLease {
  Id: number
  Label: string
  LeaseStartDate: string
  LeaseEndDate: string
  LeaseMonthlyAmount: string
  [key: string]: unknown
}

export interface RentilaPayment {
  Id: number
  PropertyID: number
  LandlordID: number
  TenantID: number
  LeaseID: number
  PaymentStatus: number // 0 = pending, 2 = paid, -1 = lost (per the app's dropdown — "partial" is a separate flow, not a fixed code)
  PaymentType: 'rent' | 'expense' | string
  PaymentPerson: string
  PaymentDate: string
  PaymentDueDate: string | null
  PaymentAmount: string
  PaymentAmountPaid: number
  PaymentAmountLeft: number
  [key: string]: unknown
}

/**
 * Thin, deliberately READ-ONLY client for api2.rentila.com.
 *
 * Confirmed by hand on 2026-08-07 via `curl -X OPTIONS` against every known
 * resource (properties, tenants, leases, payments — both collection and
 * item routes): the server responds `405 Method Not Allowed` with
 * `Allow: GET` for anything else. This app-level client_credentials token
 * cannot write payment status — see the plan doc's "write-back" section for
 * the notify-and-deep-link fallback that drives. Do NOT add POST/PUT/PATCH
 * methods here against this REST surface without re-confirming first.
 */
export function createRentilaClient(credentials: RentilaCredentials) {
  async function get<T>(path: string, query?: Record<string, string | number | undefined>) {
    const accessToken = await getAccessToken(credentials)
    return $fetch<T>(path, {
      baseURL: BASE_URL,
      method: 'GET',
      query,
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  return {
    listProperties: () => get<{ items: RentilaProperty[]; pagination: RentilaPagination }>('/landlord/properties'),
    getProperty: (id: number) => get<{ item: RentilaProperty }>(`/landlord/properties/${id}`),
    listTenants: () => get<{ items: RentilaTenant[]; pagination: RentilaPagination }>('/landlord/tenants'),
    listLeases: () => get<{ items: RentilaLease[]; pagination: RentilaPagination }>('/landlord/leases'),
    listPayments: (propertyId?: number) =>
      get<{ items: RentilaPayment[]; pagination: RentilaPagination }>('/landlord/payments', {
        PropertyID: propertyId,
      }),
    getPayment: (id: number) => get<{ item: RentilaPayment }>(`/landlord/payments/${id}`),
  }
}
