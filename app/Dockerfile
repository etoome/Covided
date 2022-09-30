# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /covided
COPY package.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /covided
COPY . .
COPY --from=deps /covided/node_modules ./node_modules
RUN npm run build

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /covided

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /covided/next.config.js ./
COPY --from=builder /covided/public ./public
COPY --from=builder --chown=nextjs:nodejs /covided/.next ./.next
COPY --from=builder /covided/node_modules ./node_modules
COPY --from=builder /covided/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
