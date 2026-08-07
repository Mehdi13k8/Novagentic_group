# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Run ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# 3001, not 3000: Azure "sitecontainers" (sidecar) mode puts every container
# on the SAME localhost network namespace instead of giving each one its own
# hostname — unlike novagentic, which is 3000, this can't collide with it.
ENV NITRO_PORT=3001
ENV NITRO_HOST=0.0.0.0
COPY --from=build --chown=node:node /app/.output ./.output
EXPOSE 3001
USER node
CMD ["node", ".output/server/index.mjs"]
