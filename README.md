# Aurora Music

A modern full-stack music streaming app inspired by Spotify. It uses YouTube Data API metadata and YouTube embedded playback so the app does not host or extract copyrighted music files.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth
- Music source: YouTube Data API v3 with demo fallbacks when `YOUTUBE_API_KEY` is not set
- Deployment: Vercel for web, Render/Railway-style API service, MongoDB Atlas

## Features Included

- Email/password auth, Google ID token endpoint, JWT sessions, user profiles
- YouTube music search, trending, recommendations, recently played, liked songs
- Queue, shuffle, repeat, volume, mini mode, crossfade/sleep timer settings
- Playlist CRUD, collaborative playlist model, add/remove/reorder endpoints
- Artist and album detail pages driven by search
- Admin dashboard with users/playlists/plays/liked song analytics
- PWA manifest and service worker
- Docker support for web, API, and MongoDB

## Legal Playback Note

Aurora intentionally uses YouTube embedded playback and official API metadata. It does not download, proxy, rehost, or extract audio streams. If you add a different playback backend, review YouTube Terms of Service and copyright obligations first.

## Getting Started

```bash
npm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.

## Environment Variables

API:

- `PORT`
- `CLIENT_ORIGIN`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `YOUTUBE_API_KEY`

Web:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_YOUTUBE_PLAYER_MODE`

## Docker

```bash
docker compose up --build
```

## Project Structure

```text
apps/
  api/   Express API, Mongoose models, auth, admin, recommendations
  web/   Next.js app, Spotify-style UI, player, PWA
packages/
  shared/ TypeScript contracts shared by web and API
```

## Production Checklist

- Set a strong `JWT_SECRET`
- Configure MongoDB Atlas and network access
- Add a YouTube Data API v3 key
- Add Google OAuth client IDs for web and API
- Configure `CLIENT_ORIGIN` to your Vercel domain
- Promote the first admin user in MongoDB or add an internal admin bootstrap script
