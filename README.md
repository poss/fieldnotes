# FieldNotes

A public ambient audio map. Upload short sound clips, attach them to places, and explore how the world sounds.

## Concept

FieldNotes is a living map of how places sound — a field recording archive, not a social network. People upload short ambient sound clips tied to general areas on a map. Listeners browse areas, tap a neighborhood, and hear what it sounds like there.

The public map uses **generalized areas**, not exact pins. When someone uploads a recording, their exact location is never shown publicly. Instead, sounds are grouped into neighborhood-sized hexagonal areas (~1.2km²) using the [H3 spatial index](https://h3geo.org/). This preserves privacy and creates an atmospheric, area-based browsing experience.

## Philosophy

- **Quiet and atmospheric** — not loud, not social, not gamified
- **Map-first** — the map is the primary interface
- **Privacy-safe** — exact coordinates are never publicly exposed
- **Low-cost** — built entirely on open-source and free-tier services
- **Portable** — standard Postgres schema, no vendor lock-in

## Stack

| Layer | Choice | Open Source? | Cost |
|-------|--------|-------------|------|
| Framework | Next.js 16 (App Router) | MIT | Free |
| Language | TypeScript | MIT | Free |
| Styling | Tailwind CSS v4 | MIT | Free |
| Map | MapLibre GL JS | BSD-3 | Free |
| Tiles | OpenFreeMap (OSM) | Free | Free |
| Spatial index | H3-js | Apache 2.0 | Free |
| Database | Supabase (Postgres) | Apache 2.0 | Free tier |
| Auth | Supabase Auth | Apache 2.0 | Free tier |
| Storage | Supabase Storage | Apache 2.0 | Free tier |

Everything is open source. Supabase can be self-hosted if needed.

## Local Setup

```bash
git clone https://github.com/poss/fieldnotes.git
cd fieldnotes
npm install
```

### Without Supabase (seed data mode)

```bash
npm run dev
```

The app will show 10 seed sound posts in NYC. No database or auth features.

### With Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Create a storage bucket named `audio`, set to public
4. Add storage RLS policies (see migration file comments)
5. Copy `env.example` to `.env.local` and fill in your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### Uploads
1. User selects a short audio clip (max 20 seconds, 5MB)
2. App asks for device location permission
3. If granted, map centers on current location; user can refine by dragging
4. If denied, user manually places the sound on the map
5. A dashed hex overlay shows the generalized area that will be public
6. User adds a title and optional note, then submits
7. Audio goes to Supabase Storage; metadata goes to Postgres
8. Exact coordinates are stored privately; only the H3 cell center is public

### Public Map
- Areas with sounds appear as soft hexagonal regions
- Tapping an area opens a bottom sheet with all sounds from that neighborhood
- Each sound has a play button, title, note, and metadata
- Clicking a sound title goes to its detail page
- No exact pins, no user tracking, no social mechanics

### Routes
- `/` — Map homepage
- `/login`, `/signup` — Authentication
- `/upload` — Upload a sound (protected)
- `/sounds/[id]` — Sound detail with large player
- `/u/[username]` — Public profile
- `/settings` — Edit profile (protected)
- `/report/[soundId]` — Report a sound

## Project Structure

```
app/              Routes (App Router)
components/
  auth/           Login, signup, auth button
  map/            MapLibre map shell, view wrapper
  sounds/         Area sheet, sound cards, sound detail
  upload/         File picker, location picker, metadata form
  profile/        Profile view, settings form
  report/         Report form
lib/
  config/site.ts  Site name, upload limits, map defaults
  supabase/       Client helpers, types, storage URLs
  data/           DB queries (sounds, profiles) + seed data
  geo/area.ts     H3 spatial index helpers
  utils/          Formatting helpers
supabase/
  migrations/     SQL schema
```

## Current Status

All core features are implemented and live:
- Map homepage with H3 area bubbles
- Authentication (signup, login, session management)
- Upload flow (file validation, location picker with reticle, metadata)
- Audio playback with progress bar
- Sound detail page
- Public profile page
- Settings page
- Report flow
