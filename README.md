# Juke-Stream

Music sharing and streaming web application built with the MERN stack (MongoDB, Express, React, Node.js). Users can upload audio files, create playlists, and stream music from their browser.

https://user-images.githubusercontent.com/86356896/222892991-06e0b79e-e7b3-47d0-8121-25261df8d728.mp4

## Features

- User authentication and authorization with JWT tokens
- Audio file upload (mp3, wav, and other formats stored via GridFS in MongoDB)
- Playlist creation and management
- Audio streaming with player controls (play, pause, skip)
- Responsive design

---

## Requirements

| Dependency | Version |
|---|---|
| Node.js | 18 or later |
| npm | 9 or later |
| MongoDB | 6 or later (local or Atlas) |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Abhi-Bhat18/Juke-Stream.git
cd Juke-Stream
```

### 2. Install dependencies

Install frontend dependencies (from the repo root):

```bash
npm install
```

Install backend dependencies:

```bash
cd API && npm install && cd ..
```

### 3. Configure environment variables

Create an `.env` file inside the `API/` directory:

```bash
cp API/.env.example API/.env   # if the example exists, otherwise create it manually
```

Edit `API/.env` and set these values:

```env
MONGO_URI=mongodb://localhost:27017/jukestream
JWT_SECRET=replace_with_a_long_random_string
NODE_ENV=development
```

- **MONGO_URI** — connection string for your MongoDB instance.  
  - Local MongoDB: `mongodb://localhost:27017/jukestream`  
  - MongoDB Atlas: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/jukestream?retryWrites=true&w=majority`
- **JWT_SECRET** — any long, unpredictable string (e.g. output of `openssl rand -hex 32`).

### 4. Start MongoDB (if running locally)

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu / Debian
sudo systemctl start mongod

# Docker (one-liner, no install needed)
docker run -d --name mongo -p 27017:27017 mongo:6
```

### 5. Run the application

Open **two terminals**:

**Terminal 1 — Frontend (Vite dev server, http://localhost:5173)**

```bash
npm run dev
```

**Terminal 2 — Backend (Express API, http://localhost:1337)**

```bash
cd API
node server.js
```

The React app proxies API calls to the backend. Open http://localhost:5173 in your browser.

---

## RUNBOOK

Quick copy-paste sequence for a fresh machine (assumes Node 18+ and a running MongoDB):

```bash
# 1. Clone & enter
git clone https://github.com/Abhi-Bhat18/Juke-Stream.git
cd Juke-Stream

# 2. Install all deps
npm install
cd API && npm install && cd ..

# 3. Create backend env file
cat > API/.env << 'EOF'
MONGO_URI=mongodb://localhost:27017/jukestream
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=development
EOF

# 4. Start MongoDB via Docker if you don't have it installed
docker run -d --name mongo -p 27017:27017 mongo:6

# 5. Start backend
cd API && node server.js &

# 6. Start frontend
cd ..
npm run dev
```

Visit http://localhost:5173.

---

## Production Build (serve everything from Node)

Build the React app first, then let Express serve the static files:

```bash
# Build frontend
npm run build          # outputs to dist/

# Start only the backend — it serves dist/ as static files
cd API
NODE_ENV=production node server.js
```

The entire app is now available at http://localhost:1337.

---

## Self-Hosting

### Option A — Docker Compose (recommended)

Create a `docker-compose.yml` in the repo root:

```yaml
version: "3.9"

services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  app:
    build: .
    restart: unless-stopped
    ports:
      - "1337:1337"
    environment:
      MONGO_URI: mongodb://mongo:27017/jukestream
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - mongo

volumes:
  mongo_data:
```

Create a `Dockerfile` in the repo root:

```dockerfile
# ── build stage ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install frontend deps and build
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build          # → /app/dist

# ── runtime stage ────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install backend deps
COPY API/package*.json ./API/
RUN cd API && npm ci --omit=dev

# Copy backend source and built frontend
COPY API/ ./API/
COPY --from=builder /app/dist ./dist

EXPOSE 1337

CMD ["node", "API/server.js"]
```

Then start everything:

```bash
# Set your secret
export JWT_SECRET=$(openssl rand -hex 32)

# Build and start
docker compose up -d --build

# Check logs
docker compose logs -f app
```

The app is available at http://localhost:1337.

To stop:

```bash
docker compose down          # stop containers, keep volumes
docker compose down -v       # stop containers AND delete database
```

---

### Option B — Build and run the Docker image manually

```bash
# Build the image
docker build -t jukestream:latest .

# Create a network and a named volume
docker network create jukestream-net
docker volume create mongo_data

# Start MongoDB
docker run -d \
  --name mongo \
  --network jukestream-net \
  -v mongo_data:/data/db \
  mongo:6

# Start the app
docker run -d \
  --name jukestream \
  --network jukestream-net \
  -p 1337:1337 \
  -e MONGO_URI=mongodb://mongo:27017/jukestream \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e NODE_ENV=production \
  jukestream:latest
```

App available at http://localhost:1337.

---

### Option C — VPS / bare metal (Ubuntu example)

```bash
# 1. Install Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install MongoDB 6
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod

# 3. Clone and build
git clone https://github.com/Abhi-Bhat18/Juke-Stream.git
cd Juke-Stream
npm install
npm run build
cd API && npm install --omit=dev && cd ..

# 4. Set env vars
cat > API/.env << EOF
MONGO_URI=mongodb://127.0.0.1:27017/jukestream
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# 5. Run with PM2 (keeps process alive after SSH logout)
npm install -g pm2
pm2 start API/server.js --name jukestream
pm2 save
pm2 startup    # follow the printed command to enable on boot
```

App available at http://<your-server-ip>:1337.

---

## Environment Variable Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign JWT tokens |
| `NODE_ENV` | No | `development` | Set to `production` in deployed environments |

---

## Project Structure

```
Juke-Stream/
├── src/                  # React frontend source
├── public/               # Static assets
├── index.html            # Vite HTML entry point
├── vite.config.js        # Vite configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
├── dist/                 # Built frontend (generated by `npm run build`)
└── API/
    ├── server.js         # Express entry point (port 1337)
    ├── config/
    │   └── db.js         # MongoDB connection
    ├── controllers/      # Route handlers
    ├── middlewares/      # JWT auth middleware
    ├── models/           # Mongoose schemas
    ├── routes/           # Express routers
    └── uploads/          # GridFS upload staging
```

---

## Troubleshooting

**MongoDB connection refused**  
Make sure MongoDB is running: `mongod --version` and `sudo systemctl status mongod`.

**Port 1337 already in use**  
Find and kill the process: `lsof -ti:1337 | xargs kill -9`.

**Audio upload fails**  
The backend uses GridFS to store audio directly in MongoDB — no extra storage bucket is needed. Ensure `MONGO_URI` points to a writable database.

**JWT errors on requests**  
Verify `JWT_SECRET` is set in `API/.env` and that the server was restarted after changing it.
