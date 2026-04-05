/**
 * Seed the Supabase database with realistic test data.
 *
 * Prerequisites:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (find it in Supabase Dashboard → Settings → API)
 *   2. Run: node --env-file=.env.local --import tsx/esm scripts/seed-db.ts
 *      Or:   npx tsx --env-file=.env.local scripts/seed-db.ts
 *
 * Creates:
 *   - 4 test users (lena, kai, ravi, maya)
 *   - 10 sound posts across NYC with silent audio placeholders
 *
 * Safe to re-run — existing users are skipped, sounds are re-inserted.
 */

import { createClient } from "@supabase/supabase-js";
import { latLngToCell, cellToLatLng } from "h3-js";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\nMissing required env vars.\n" +
    "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local.\n" +
    "Run: node --env-file=.env.local --import tsx/esm scripts/seed-db.ts\n"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const H3_RESOLUTION = 7;

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const USERS = [
  { username: "lena",  displayName: "Lena M.",    email: "lena@fieldnotes.test",  bio: "Field recordist. Interested in transit sounds and early mornings." },
  { username: "kai",   displayName: "Kai",         email: "kai@fieldnotes.test",   bio: null },
  { username: "ravi",  displayName: "Ravi S.",     email: "ravi@fieldnotes.test",  bio: "Documenting the city one block at a time." },
  { username: "maya",  displayName: "Maya Chen",   email: "maya@fieldnotes.test",  bio: "Sound designer. Capturing texture." },
];

const SOUNDS = [
  {
    title: "Morning pigeons under the bridge",
    note: "Recorded just after sunrise. The echo off the stone is something else.",
    username: "lena", durationSeconds: 18, lat: 40.7061, lng: -73.9969,
    areaLabel: "Brooklyn Bridge", createdAt: "2025-11-12T07:15:00Z",
  },
  {
    title: "Rain on the High Line",
    note: "Light drizzle hitting the metal railings and wooden planks.",
    username: "kai", durationSeconds: 15, lat: 40.748, lng: -74.0048,
    areaLabel: "Chelsea", createdAt: "2025-11-20T14:30:00Z",
  },
  {
    title: "Subway platform hum",
    note: null,
    username: "ravi", durationSeconds: 12, lat: 40.7527, lng: -73.9772,
    areaLabel: "Midtown", createdAt: "2025-12-01T09:00:00Z",
  },
  {
    title: "Wind through Prospect Park",
    note: "Late autumn, most of the leaves are gone. Just branches and wind.",
    username: "lena", durationSeconds: 20, lat: 40.6602, lng: -73.969,
    areaLabel: "Prospect Park", createdAt: "2025-12-05T16:45:00Z",
  },
  {
    title: "Chinatown afternoon",
    note: "Vendors, traffic, fragments of conversation.",
    username: "maya", durationSeconds: 17, lat: 40.7158, lng: -73.997,
    areaLabel: "Chinatown", createdAt: "2025-12-10T13:20:00Z",
  },
  {
    title: "Ferry horn at dusk",
    note: "Staten Island Ferry pulling away. The low horn resonates across the water.",
    username: "kai", durationSeconds: 8, lat: 40.7006, lng: -74.0131,
    areaLabel: "Battery Park", createdAt: "2025-12-15T17:00:00Z",
  },
  {
    title: "Basketball court echo",
    note: "The ball hitting the concrete, sneakers squeaking, someone counting score.",
    username: "ravi", durationSeconds: 14, lat: 40.7295, lng: -73.9965,
    areaLabel: "West Village", createdAt: "2025-12-18T11:30:00Z",
  },
  {
    title: "Quiet snowfall in Central Park",
    note: "Almost nothing. Just snow landing on snow.",
    username: "lena", durationSeconds: 20, lat: 40.7829, lng: -73.9654,
    areaLabel: "Central Park", createdAt: "2026-01-08T08:00:00Z",
  },
  {
    title: "A train arriving at 125th",
    note: null,
    username: "maya", durationSeconds: 11, lat: 40.8109, lng: -73.9455,
    areaLabel: "Harlem", createdAt: "2026-01-15T18:45:00Z",
  },
  {
    title: "Ice cream truck melody, fading",
    note: "It drove past slowly and the melody Doppler-shifted. Summer feeling in January somehow.",
    username: "kai", durationSeconds: 16, lat: 40.6892, lng: -73.9857,
    areaLabel: "Cobble Hill", createdAt: "2026-01-22T15:10:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a minimal valid WAV file with silence for the given duration. */
function makeSilentWav(durationSeconds: number): Buffer {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 8;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;

  const buf = Buffer.alloc(44 + dataSize, 128); // 128 = silence for unsigned 8-bit PCM
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);   // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding FieldNotes database...\n");

  // 1. Create auth users and collect their IDs
  const userIdByUsername: Record<string, string> = {};

  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: "fieldnotes123",
      email_confirm: true,
      user_metadata: {
        username: u.username,
        display_name: u.displayName,
      },
    });

    if (error) {
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        // User exists — look up by email
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((usr) => usr.email === u.email);
        if (existing) {
          userIdByUsername[u.username] = existing.id;
          console.log(`  ↩ User already exists: ${u.username} (${existing.id})`);
        } else {
          console.error(`  ✗ Could not find existing user: ${u.email}`);
        }
      } else {
        console.error(`  ✗ Failed to create user ${u.username}:`, error.message);
      }
      continue;
    }

    if (data.user) {
      userIdByUsername[u.username] = data.user.id;
      console.log(`  ✓ Created user: ${u.username} (${data.user.id})`);
    }
  }

  // 2. Update profiles (trigger creates them; we set display_name and bio)
  for (const u of USERS) {
    const userId = userIdByUsername[u.username];
    if (!userId) continue;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username: u.username,
        display_name: u.displayName,
        bio: u.bio,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`  ✗ Failed to upsert profile for ${u.username}:`, error.message);
    } else {
      console.log(`  ✓ Profile updated: ${u.username}`);
    }
  }

  console.log("");

  // 3. Upload audio + insert sound_posts
  for (const s of SOUNDS) {
    const userId = userIdByUsername[s.username];
    if (!userId) {
      console.log(`  ↩ Skipping sound "${s.title}" — user ${s.username} not found`);
      continue;
    }

    // Compute H3 area
    const areaIndex = latLngToCell(s.lat, s.lng, H3_RESOLUTION);
    const [pubLat, pubLng] = cellToLatLng(areaIndex);

    // Upload silent WAV
    const audioId = randomUUID();
    const audioPath = `${userId}/${audioId}.wav`;
    const wavBuffer = makeSilentWav(s.durationSeconds);

    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(audioPath, wavBuffer, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ✗ Upload failed for "${s.title}":`, uploadError.message);
      continue;
    }

    // Insert sound post
    const { error: insertError } = await supabase.from("sound_posts").insert({
      user_id: userId,
      title: s.title,
      note: s.note,
      audio_path: audioPath,
      duration_seconds: s.durationSeconds,
      capture_latitude: s.lat,
      capture_longitude: s.lng,
      public_area_index: areaIndex,
      public_area_label: s.areaLabel,
      public_latitude: pubLat,
      public_longitude: pubLng,
      location_source: "device",
      created_at: s.createdAt,
      status: "active",
      is_public: true,
    });

    if (insertError) {
      console.error(`  ✗ Insert failed for "${s.title}":`, insertError.message);
      // Clean up uploaded file
      await supabase.storage.from("audio").remove([audioPath]);
    } else {
      console.log(`  ✓ Sound: "${s.title}" (${s.areaLabel})`);
    }
  }

  console.log("\nDone.");
  console.log("\nTest accounts (password: fieldnotes123):");
  for (const u of USERS) {
    console.log(`  ${u.email}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
