# Juke-Stream

Music sharing and streaming web application built on the MERN stack. Users can upload audio files, create playlists, and stream music from any device.

https://user-images.githubusercontent.com/86356896/222892991-06e0b79e-e7b3-47d0-8121-25261df8d728.mp4

## Features

- User authentication and authorization (JWT)
- Upload audio files in multiple formats
- Create and manage playlists
- Stream audio with player controls (play, pause, skip)
- Public song browsing without login
- Responsive design

## Tech Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit  |
| Backend  | Node.js, Express 4                           |
| Database | MongoDB 6+ (GridFS for audio file storage)   |
| Auth     | JWT (jsonwebtoken), bcryptjs                 |

---

## Local Development Setup

### Prerequisites

- **Node.js** 18+ — [download](https://nodejs.org/)
- **MongoDB** 6+ running locally — [install guide](https://www.mongodb.com/docs/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/Abhi-Bhat18/juke-stream.git
cd juke-stream
```

### 2. Install dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd API && npm install && cd ..
```

### 3. Configure environment variables

```bash
cp .env.example API/.env
```

Edit `API/.env` and set your values:

```env
MONGO_URI=mongodb://localhost:27017/music_streaming
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

> **MongoDB Atlas**: replace `MONGO_URI` with your Atlas connection string, e.g.  
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/music_streaming`

### 4. Start the development servers

Open two terminals:

**Terminal 1 — Frontend (Vite dev server on port 5173)**

```bash
npm run dev
```

**Terminal 2 — Backend (Express API on port 1337)**

```bash
cd API
node server.js
```

The app is now available at:
- Frontend (hot-reload): http://localhost:5173
- API: http://localhost:1337

---

## Self-Hosting

### Option A — Docker Compose (recommended)

Spins up the app and MongoDB in one command. No Node.js or MongoDB installation needed.

**Prerequisites**: [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Set a strong JWT secret
export JWT_SECRET=your_super_secret_jwt_key_change_this

# 2. Build and start all services
docker compose up -d

# 3. Verify everything is running
docker compose ps
```

The application is available at **http://localhost:1337**.

To stop:

```bash
docker compose down
```

To stop and remove all data (MongoDB volume):

```bash
docker compose down -v
```

---

### Option B — Build the Docker image manually

```bash
# Build the image
docker build -t juke-stream:latest .

# Run with an external MongoDB connection
docker run -d \
  --name juke-stream \
  -p 1337:1337 \
  -e MONGO_URI="mongodb://host.docker.internal:27017/music_streaming" \
  -e JWT_SECRET="your_super_secret_jwt_key_change_this" \
  -e NODE_ENV=production \
  juke-stream:latest
```

> On Linux, replace `host.docker.internal` with your host IP or use `--network host`.

---

### Option C — Manual production deployment (no Docker)

Use this method on a VPS / bare-metal server.

**Prerequisites**: Node.js 18+, MongoDB 6+ running locally or remote.

```bash
# 1. Clone the repo
git clone https://github.com/Abhi-Bhat18/juke-stream.git
cd juke-stream

# 2. Install and build the frontend
npm install
npm run build          # outputs to dist/

# 3. Install backend production dependencies
cd API
npm install --omit=dev

# 4. Set environment variables
cat > .env <<EOF
MONGO_URI=mongodb://localhost:27017/music_streaming
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=production
EOF

# 5. Start the server
node server.js
```

The server serves the built frontend from `../dist` and the API on port 1337.

**Keep it running with PM2:**

```bash
npm install -g pm2
pm2 start server.js --name juke-stream
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

---

### Option D — Reverse proxy with Nginx (production)

Serve the app behind Nginx with TLS.

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass         http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;
    }
}
```

---

## Environment Variables

| Variable    | Required | Default                                       | Description                                  |
|-------------|----------|-----------------------------------------------|----------------------------------------------|
| `MONGO_URI` | Yes      | `mongodb://localhost:27017/music_streaming`   | MongoDB connection string                    |
| `JWT_SECRET`| Yes      | —                                             | Secret used to sign JWT tokens — keep private|
| `NODE_ENV`  | No       | `development`                                 | Set to `production` for production deploys   |

---

## API Reference

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | `/api/v1/auth/register`         | No   | Create account           |
| POST   | `/api/v1/auth/login`            | No   | Login, returns JWT       |
| GET    | `/api/v1/songs`                 | No   | List all songs           |
| GET    | `/api/v1/stream/:filename`      | No   | Stream audio file        |
| POST   | `/api/v1/song/upload`           | Yes  | Upload a song            |
| DELETE | `/api/v1/song/delete/:id`       | Yes  | Delete your song         |
| GET    | `/api/v1/playlist`              | Yes  | Get your playlists       |
| POST   | `/api/v1/playlist`              | Yes  | Create a playlist        |

---

## Troubleshooting

**MongoDB connection refused**  
Confirm MongoDB is running: `mongosh --eval "db.runCommand({ ping: 1 })"`

**Port 1337 already in use**  
`lsof -ti:1337 | xargs kill` then restart the server.

**Frontend changes not reflected in production**  
Re-run `npm run build` from the project root, then restart the backend.

**Docker: changes not reflected after rebuild**  
`docker compose build --no-cache && docker compose up -d`
