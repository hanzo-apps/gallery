# gallery.hanzo.ai — the Hanzo template gallery (72 real templates).
# Next.js static export (output: 'export') served by hanzoai/static — NOT nginx.
# Two stages: build the export, then re-serve it through the canonical static server.

# 1) Build the Next.js static export -> /app/out
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# next.config.ts sets output:'export'; produces /app/out. Turbopack build can be
# flaky in CI containers, so build with the stable webpack builder.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 2) Serve the static export with hanzoai/static. --spa rewrites unknown routes
#    to index.html (client routing); :3000 is the static default, and the
#    gallery-site Service maps servicePort 80 -> targetPort 3000.
FROM ghcr.io/hanzoai/static:0.4.1
COPY --from=build /app/out /srv
EXPOSE 3000
ENTRYPOINT ["/static", "--root=/srv", "--spa", "--port=3000"]
