FROM node:21-alpine AS build

# ENV NODE_ENV=production
# global npm dependencies: recommended to place those dependencies in the non-root user directory
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
# optionally if you want to run npm global bin without specifying path
ENV PATH=$PATH:/home/node/.npm-global/bin
# increase max memory for nodejs
ENV NODE_OPTIONS=--max-old-space-size=4096
# pnpm setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

RUN ls -la

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/login ./apps/login
COPY packages ./packages

RUN ls -la /usr/src/app
RUN ls -la /usr/src/app/apps/login

# install dependencies
RUN apk add git
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm install turbo --global
# RUN pnpm exec next telemetry disable
RUN turbo run build
RUN turbo run build:standalone

RUN ls -la /usr/src/app/apps/login
RUN ls -la /usr/src/app/apps/login/.next/

FROM node:21-alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# If /.env-file/.env is mounted into the container, its variables are made available to the server before it starts up.
RUN mkdir -p /.env-file && touch /.env-file/.env && chown -R nextjs:nodejs /.env-file

COPY --from=build --chown=nextjs:nodejs /usr/src/app/apps/login/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /usr/src/app/apps/login/.next/static ./apps/login/.next/static
COPY --from=build --chown=nextjs:nodejs /usr/src/app/apps/login/public ./apps/login/public

RUN export NEXT_TELEMETRY_DISABLED=1

USER nextjs
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "-c", " set -o allexport && . /.env-file/.env && set +o allexport && node apps/login/server.js"]
