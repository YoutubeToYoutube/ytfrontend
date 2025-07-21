# Stage 1: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build:no-check

# Stage 2: Serve the app with a static server
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
