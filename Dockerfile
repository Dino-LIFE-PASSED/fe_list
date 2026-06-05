# Stage 1: Build React client
FROM node:20-alpine AS client-builder
WORKDIR /build
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ .
COPY --from=client-builder /build/dist ./public

RUN mkdir -p uploads

EXPOSE 3001
CMD ["node", "index.js"]
