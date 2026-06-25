# Juke-Stream
Music sharing and Streaming web application

This is a full-stack web application built with the MERN (MongoDB, Express, React, Node.js) stack that allows users to share and stream their favorite audio files. Users can create playlists, upload audio files, and explore other users' collections.

https://user-images.githubusercontent.com/86356896/222892991-06e0b79e-e7b3-47d0-8121-25261df8d728.mp4

## Features
* User authentication and authorization using JWT tokens.
* User profile page to manage uploaded audio files and playlists.
* Audio file upload with support for multiple file formats.
* Playlist creation and management.
* Audio streaming with player controls (play, pause, skip, etc.).
* **Audio visualizer** — animated frequency bar display that appears above the player bar whenever a song is playing.
* Responsive design for optimal viewing on any device.

## RUNBOOK

### Prerequisites
* Node.js 16+ and npm
* MongoDB instance (local or Atlas)

### Install

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd API && npm install && cd ..
```

### Configure

Create `API/.env`:
```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

### Run

Start the backend (runs on http://localhost:1337):
```bash
cd API && node server.js
```

Start the frontend dev server (runs on http://localhost:5173):
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Test the audio visualizer

1. Register or log in.
2. Upload an audio file via the **Upload** page.
3. Navigate to **Explore** and click a song card to play it.
4. The visualizer (animated frequency bars, cyan → purple gradient) appears above the bottom player bar while the song plays, and fades out when paused or ended.

### Build for production

```bash
npm run build   # outputs to dist/
```
