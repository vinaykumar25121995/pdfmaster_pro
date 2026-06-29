# Build Environment
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy configuration and sources
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY src/ ./src

# Build production Next.js bundle
RUN npm run build

# Execution Runner
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/src/app/globals.css ./src/app/globals.css

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
