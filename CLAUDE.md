# FieldNotes — Project Context

## What this is
FieldNotes is a public ambient audio map where people upload short sound clips attached to general areas on a map. It's a field recording archive, not a social network.

## Core decisions
- **Name:** FieldNotes (configurable via `lib/config/site.ts`)
- **Deployment:** Will likely be a subdomain of Drew's personal site
- **Privacy model:** Public map shows generalized H3 hex areas (resolution 7, ~1.2km²), never exact coordinates
- **Cost target:** Near-zero recurring cost. All open-source stack except Supabase hosted (free tier)
- **No social features:** No comments, follows, DMs, notifications, likes, feeds

## Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- MapLibre GL JS with OpenFreeMap tiles (free, no API key)
- H3-js for area bucketing (resolution 7)
- Supabase for auth, Postgres, and storage (free tier)

## Architecture
- `lib/config/site.ts` — single source for site name, upload limits, map defaults, validation rules
- `lib/geo/area.ts` — H3 helpers for coordinate-to-area conversion
- `lib/supabase/` — client.ts (browser), server.ts (server), middleware.ts (session refresh), types.ts, storage.ts
- `lib/data/sounds.ts` — DB queries: getAreaGroups, getSoundById, getSoundsByUser
- `lib/data/profiles.ts` — DB queries: getProfileByUsername, getProfileById
- `lib/data/seed.ts` — fake NYC seed data, used as fallback when Supabase is not configured
- `components/map/map-view.tsx` — exports AreaGroup and AreaSound types used across components
- `components/map/map-shell.tsx` — MapLibre map, accepts areaGroups as prop
- `components/sounds/` — area sheet, sound cards with audio playback, sound detail
- `components/upload/` — multi-step upload wizard: file picker, location picker, metadata form
- `components/auth/` — login form, signup form, auth button for header
- `components/profile/` — profile view, settings form
- `components/report/` — report form
- `middleware.ts` — Next.js middleware for auth session refresh + protected route redirect

## Key types
- `AreaGroup` and `AreaSound` (in map-view.tsx) — normalized types for map and UI display
- `PublicSoundPost`, `SoundPostWithProfile` (in supabase/types.ts) — DB row types
- `SeedSoundPost` (in data/seed.ts) — seed data type, maps to AreaSound via page.tsx

## Design direction
- Quiet, atmospheric, editorial, slightly poetic
- Off-white (#faf9f7), warm charcoal, muted accent (#8b7355)
- CSS custom properties defined in `globals.css`
- Geist font (sans + mono)

## Upload flow
1. File picker: validates format, size (5MB), duration (20s)
2. Location picker: asks for device geolocation, shows MapLibre map with fixed center reticle
3. H3 area polygon rendered as dashed overlay on location picker map
4. Metadata form: title (required, 100 char), note (optional, 500 char)
5. Submit: upload audio to Supabase Storage, insert to sound_posts, redirect to detail page
6. Exact coords stored privately; only H3 cell center shown publicly

## Routes
- `/` — map homepage (seed fallback if no Supabase)
- `/login`, `/signup` — auth (route group with shared layout)
- `/upload` — protected, multi-step upload wizard
- `/sounds/[id]` — sound detail with large player
- `/u/[username]` — public profile with user's sounds
- `/settings` — protected, edit display name and bio
- `/report/[soundId]` — report a sound

## Database
- Schema in `supabase/migrations/001_initial_schema.sql`
- Tables: profiles, sound_posts, sound_reports
- View: public_sound_posts (excludes private coords)
- Trigger: auto-creates profile on auth signup
- RLS enabled on all tables

## Map tile source
Using OpenFreeMap liberty style — fully free, no API key, no usage limits.

## Build commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Current status
- Phases 1-3 code complete, Phase 4 (report) also done
- All routes build clean
- **To go live:** need Supabase project created, .env.local configured, SQL migration run, storage bucket created
- Remaining polish: mobile touch gestures on bottom sheet, map pulse animations, server-side validation via Server Action, upload rate limiting
