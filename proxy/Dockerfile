# Front door for the shared "Novagentic" Web App, running as the `isMain`
# sitecontainer (see ../.github/workflows/*.yml) — the only one exposed to
# the internet. Routes by Host header to novagentic (127.0.0.1:3000) or
# palier (127.0.0.1:3001), both on this same container's localhost since
# Azure's sitecontainers/sidecar mode shares one network namespace across
# every container in the site. See nginx.conf for the routing rules.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
