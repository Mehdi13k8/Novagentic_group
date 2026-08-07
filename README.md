# Novagentic

Agency landing page for Novagentic (Mehdi Rhoulam & Martin André). Nuxt 4 SSR
app, deployed as a container to Azure App Service on the custom domains
[novagentic.fr](https://novagentic.fr) and
[novagentix.fr](https://novagentix.fr).

## Stack

- [Nuxt 4](https://nuxt.com/) (Vue 3, Nitro server)
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [`@azure/communication-email`](https://www.npmjs.com/package/@azure/communication-email)
  for the contact form
- Docker (multi-stage, non-root, Nitro on port 3000) for deployment

## Project structure

```
app/
  pages/index.vue          # the landing page (hero, founders, case studies)
  assets/css/main.css       # design tokens (colors, type) + global styles
  assets/img/               # founder photos
  composables/              # useScrollReveal (scroll-in animations)
  app.vue                   # root component (<NuxtPage />)
server/
  api/contact.post.ts       # POST /api/contact — sends email via Azure Communication Services
scripts/
  push-app-settings.sh      # sync secrets between local .env and Azure (see below)
.github/workflows/
  novagentic-deploy.yml     # build this app's image, push to GHCR, update its sitecontainer
  palier-deploy.yml         # same, for palier/ (own image, same shared Web App)
  proxy-deploy.yml          # same, for proxy/ (nginx front door, same shared Web App)
proxy/                      # nginx front door — Host-routes to novagentic or palier internally
Dockerfile                  # container build used for deployment
nuxt.config.ts              # runtimeConfig maps NUXT_* env vars for the contact form
```

## Getting started

```bash
npm install
cp .env.example .env   # fill in the real values, see "Environment variables" below
npm run dev
```

Other scripts: `npm run build` (production build), `npm run preview` (serve
the build locally), `npm run generate` (static generation, not used in
production — this app deploys as a container/SSR server, not a static site).

## Environment variables

The contact form (`server/api/contact.post.ts`) needs four variables, listed
in `.env.example`:

| Variable | Purpose |
|---|---|
| `NUXT_ACS_CONNECTION_STRING` | Connection string for the Azure Communication Services resource (Keys blade). **Secret.** |
| `NUXT_ACS_SENDER_ADDRESS` | Verified sender address on the linked Email Communication Service (defaults to `DoNotReply@novagentic.fr`). |
| `NUXT_CONTACT_TO` | Recipient address for form submissions. |
| `NUXT_CONTACT_CC` | Comma-separated CC list. |

Nuxt maps `NUXT_<KEY>` env vars to `runtimeConfig` automatically (see
`nuxt.config.ts`), so these are read via `useRuntimeConfig()` in the API
route — no other wiring needed. Without a valid `NUXT_ACS_CONNECTION_STRING`,
the contact form responds with a 500 ("Envoi indisponible").

## Deployment

The app runs on Azure App Service in **container mode** (Web App `Novagentic`,
resource group `Novagentic_group`, France Central). It cannot run as a plain
Node/code deploy — the image is what gets deployed.

**This Web App is shared.** It runs in Azure's **sitecontainers** (sidecar)
mode — `linuxFxVersion=sitecontainers`, with one
`Microsoft.Web/sites/<site>/sitecontainers/<name>` resource per container —
carrying three containers instead of one: this marketing site (port 3000),
`palier/` (the Apartment Accounting Product, formerly `rentila-sync/`, port
3001), and `proxy/` (nginx, port 80), which is the only one actually exposed
to the internet. The proxy is the **main** container (`isMain: true`) and
Host-routes each request to whichever of the other two it's for
(`proxy/nginx.conf`). Exactly one container may have `isMain: true`.

Two consequences worth knowing:

- **All sidecars share one localhost network namespace.** There are no
  per-container hostnames (Docker Compose's service-name DNS is gone), so
  the proxy reaches the others as `127.0.0.1:3000` / `127.0.0.1:3001`, and
  every container needs a *distinct* port. That's why `palier/Dockerfile`
  moved to 3001.
- **All containers share the same environment variables.** The Web App's
  Application Settings are visible to all three — they are not scoped
  per-container. (A sidecar can override an individual variable via its own
  `environmentVariables` array.)

One Web App, one bill, and a crash in one container only restarts that
container.

> **Legacy note:** this was briefly deployed as a Docker Compose
> multi-container app (`azure-compose.yml`, since deleted). That model is
> deprecated by Azure in favour of sidecars — see
> [Migrate Docker Compose to sidecars](https://learn.microsoft.com/azure/app-service/migrate-sidecar-multi-container-apps).
> Note that `DOCKER_REGISTRY_SERVER_*` and `WEBSITES_PORT` app settings are
> **ignored** in sitecontainers mode. `WEBSITES_PORT=3000` is deliberately
> left on the Web App: it is inert here, but it is what a rollback to
> classic `DOCKER|<image>` mode would need.

Each app has its own, fully independent workflow file —
`novagentic-deploy.yml` (this app, triggers on anything outside
`palier/**`/`proxy/**`), `palier-deploy.yml` (see `palier/README.md`), and
`proxy-deploy.yml` — so a break in any one of them can never block or fail
the others. Each does the same three things on a push to `main` that
touches its own path:

1. **build** — builds that app's Docker image and pushes it to GHCR
   (`ghcr.io/mehdi13k8/novagentic`, `.../palier`, or `.../novagentic-proxy`),
   tagged with the commit SHA and `latest`. All three packages must stay
   **public** on GHCR: the sitecontainers are configured for anonymous pull,
   with no registry credentials.
2. **deploy** — logs into Azure via OIDC (`azure/login@v2`), syncs that
   app's own app settings (see below — all three apps' settings live on the
   same Web App and are visible to all three containers), then `PUT`s *only
   its own* `sitecontainers/<name>` resource, pinned to the commit SHA. Each
   app is independently SHA-pinned, so rolling one back means re-`PUT`ting
   the previous SHA — no revert commit needed, and no need to touch the
   other two.

Required GitHub Actions secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID` (OIDC login, shared by all three workflows), plus
the four `NUXT_*` secrets below for this app and whatever `palier/README.md`
lists for that one.

### Keeping the contact form's mailing config in sync (`scripts/push-app-settings.sh`)

Azure Web App "Application Settings" are how the container gets its
environment variables in production — there's no `.env` file on the server.
`scripts/push-app-settings.sh` is the single tool that keeps those settings
in sync with the `NUXT_*` keys, and it runs in **two places**:

**1. Automatically in CI, on every deploy.** The `deploy` job in
`novagentic-deploy.yml` has a "Sync app settings" step that runs this
script right before updating this app's sitecontainer:

```yaml
- name: Sync app settings
  env:
    NUXT_ACS_CONNECTION_STRING: ${{ secrets.NUXT_ACS_CONNECTION_STRING }}
    NUXT_ACS_SENDER_ADDRESS: ${{ secrets.NUXT_ACS_SENDER_ADDRESS }}
    NUXT_CONTACT_TO: ${{ secrets.NUXT_CONTACT_TO }}
    NUXT_CONTACT_CC: ${{ secrets.NUXT_CONTACT_CC }}
  run: bash scripts/push-app-settings.sh --skip-health-check
```

It reads those four values from **GitHub Actions repo secrets** (not from a
committed file — there is no `.env` in CI) and pushes them to the Azure Web
App. This means production mailing config is fully driven by CI: **if you
rotate the ACS connection string, update the `NUXT_ACS_CONNECTION_STRING`
GitHub secret**, and the next deploy will push it live automatically. Nothing
to run by hand for that path.

**2. Manually, from your own machine**, for an immediate fix without waiting
for a deploy, or to pull down what's currently live:

```bash
npm run push:env:dry-run   # preview which keys would be pushed (names only)
npm run push:env           # push local .env -> Azure Application Settings
npm run pull:env:dry-run   # preview what --pull would change (names only)
npm run pull:env           # pull Azure Application Settings -> local .env
```

Requires the [Azure CLI](https://aka.ms/azcli) installed and logged in
(`az login`) with access to the `Novagentic_group` resource group. The script
never prints secret values — only the names of the keys it touches — and
`push:env` finishes with a best-effort health check against
`https://novagentic.fr`.

If you rotate a key, update both the GitHub secret (so CI keeps pushing the
right value on future deploys) and either run `push:env`/`pull:env` locally
so your `.env` doesn't drift from what's live — the script works in both
directions on purpose.

## Custom domains

Both `novagentic.fr` (+ `www`) and `novagentix.fr` are bound to the Web App
with managed SSL certificates. DNS is hosted at IONOS.

`palier.novagentic.fr` joined them on 2026-08-08, bound to this same Web App
with its own free App Service managed certificate (SNI).
`proxy/nginx.conf` routes that hostname to the `palier` container; every
other hostname, including the raw `*.azurewebsites.net` one and probes with
no `Host` header, falls through to the marketing site.

Worth remembering if you add another subdomain: the CNAME resolving is
**not** sufficient. `palier.novagentic.fr` resolved correctly for a while
but still failed TLS, because the hostname wasn't bound to the Web App and
so had no certificate. Three steps, in order:

```bash
# 1. CNAME <sub> -> novagentic-htf8ezc8a8e9aya8.francecentral-01.azurewebsites.net
#    at IONOS (DNS is not something `az` can do here — different provider)
# 2. bind the hostname
az webapp config hostname add -g Novagentic_group --webapp-name Novagentic \
  --hostname <sub>.novagentic.fr
# 3. issue + bind a free managed certificate
az webapp config ssl create -g Novagentic_group --name Novagentic \
  --hostname <sub>.novagentic.fr
az webapp config ssl bind -g Novagentic_group -n Novagentic \
  --certificate-thumbprint <thumbprint> --ssl-type SNI
```

Then add a `server { server_name <sub>.novagentic.fr; ... }` block to
`proxy/nginx.conf` pointing at that app's port.
