# Base Image
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy sources and compile typescript
COPY tsconfig.json ./
COPY src/ ./src
RUN npm run build

# Production Runner Image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled resources
COPY --from=builder /usr/src/app/dist ./dist
RUN mkdir temp

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
