# Stage 1: Build React client
FROM node:22-alpine AS client-builder
WORKDIR /build
COPY client/package*.json ./
RUN npm ci
COPY client/ .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Stage 2: Production server
FROM node:22-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ .
COPY --from=client-builder /build/dist ./public

RUN mkdir -p uploads

EXPOSE 3001
CMD ["node", "index.js"]
