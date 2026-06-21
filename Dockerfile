### Stage 1 — build the React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html postcss.config.cjs tailwind.config.cjs vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

### Stage 2 — install backend deps and run the server
FROM node:18-alpine

WORKDIR /app

# Copy built frontend assets where server.js expects them (../dist from API/)
COPY --from=frontend-build /app/dist ./dist

# Install backend dependencies
WORKDIR /app/API
COPY API/package*.json ./
RUN npm ci --omit=dev

COPY API/ ./

EXPOSE 1337

CMD ["node", "server.js"]
