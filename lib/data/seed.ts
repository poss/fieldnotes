import { coordsToAreaIndex, areaIndexToCenter } from "@/lib/geo/area";

export interface SeedSoundPost {
  id: string;
  title: string;
  note: string | null;
  username: string;
  displayName: string;
  durationSeconds: number;
  publicAreaIndex: string;
  publicAreaLabel: string | null;
  publicLatitude: number;
  publicLongitude: number;
  createdAt: string;
}

interface SeedInput {
  id: string;
  title: string;
  note: string | null;
  username: string;
  displayName: string;
  durationSeconds: number;
  lat: number;
  lng: number;
  areaLabel: string | null;
  createdAt: string;
}

const seedInputs: SeedInput[] = [
  {
    id: "seed-1",
    title: "Morning pigeons under the bridge",
    note: "Recorded just after sunrise. The echo off the stone is something else.",
    username: "lena",
    displayName: "Lena M.",
    durationSeconds: 18,
    lat: 40.7061,
    lng: -73.9969,
    areaLabel: "Brooklyn Bridge",
    createdAt: "2025-11-12T07:15:00Z",
  },
  {
    id: "seed-2",
    title: "Rain on the High Line",
    note: "Light drizzle hitting the metal railings and wooden planks.",
    username: "kai",
    displayName: "Kai",
    durationSeconds: 15,
    lat: 40.748,
    lng: -74.0048,
    areaLabel: "Chelsea",
    createdAt: "2025-11-20T14:30:00Z",
  },
  {
    id: "seed-3",
    title: "Subway platform hum",
    note: null,
    username: "ravi",
    displayName: "Ravi S.",
    durationSeconds: 12,
    lat: 40.7527,
    lng: -73.9772,
    areaLabel: "Midtown",
    createdAt: "2025-12-01T09:00:00Z",
  },
  {
    id: "seed-4",
    title: "Wind through Prospect Park",
    note: "Late autumn, most of the leaves are gone. Just branches and wind.",
    username: "lena",
    displayName: "Lena M.",
    durationSeconds: 20,
    lat: 40.6602,
    lng: -73.969,
    areaLabel: "Prospect Park",
    createdAt: "2025-12-05T16:45:00Z",
  },
  {
    id: "seed-5",
    title: "Chinatown afternoon",
    note: "Vendors, traffic, fragments of conversation.",
    username: "maya",
    displayName: "Maya Chen",
    durationSeconds: 17,
    lat: 40.7158,
    lng: -73.997,
    areaLabel: "Chinatown",
    createdAt: "2025-12-10T13:20:00Z",
  },
  {
    id: "seed-6",
    title: "Ferry horn at dusk",
    note: "Staten Island Ferry pulling away. The low horn resonates across the water.",
    username: "kai",
    displayName: "Kai",
    durationSeconds: 8,
    lat: 40.7006,
    lng: -74.0131,
    areaLabel: "Battery Park",
    createdAt: "2025-12-15T17:00:00Z",
  },
  {
    id: "seed-7",
    title: "Basketball court echo",
    note: "The ball hitting the concrete, sneakers squeaking, someone counting score.",
    username: "ravi",
    displayName: "Ravi S.",
    durationSeconds: 14,
    lat: 40.7295,
    lng: -73.9965,
    areaLabel: "West Village",
    createdAt: "2025-12-18T11:30:00Z",
  },
  {
    id: "seed-8",
    title: "Quiet snowfall in Central Park",
    note: "Almost nothing. Just snow landing on snow.",
    username: "lena",
    displayName: "Lena M.",
    durationSeconds: 20,
    lat: 40.7829,
    lng: -73.9654,
    areaLabel: "Central Park",
    createdAt: "2026-01-08T08:00:00Z",
  },
  {
    id: "seed-9",
    title: "A train arriving at 125th",
    note: null,
    username: "maya",
    displayName: "Maya Chen",
    durationSeconds: 11,
    lat: 40.8109,
    lng: -73.9455,
    areaLabel: "Harlem",
    createdAt: "2026-01-15T18:45:00Z",
  },
  {
    id: "seed-10",
    title: "Ice cream truck melody, fading",
    note: "It drove past slowly and the melody Doppler-shifted. Summer feeling in January somehow.",
    username: "kai",
    displayName: "Kai",
    durationSeconds: 16,
    lat: 40.6892,
    lng: -73.9857,
    areaLabel: "Cobble Hill",
    createdAt: "2026-01-22T15:10:00Z",
  },
];

function buildSeedPost(input: SeedInput): SeedSoundPost {
  const areaIndex = coordsToAreaIndex(input.lat, input.lng);
  const [pubLat, pubLng] = areaIndexToCenter(areaIndex);
  return {
    id: input.id,
    title: input.title,
    note: input.note,
    username: input.username,
    displayName: input.displayName,
    durationSeconds: input.durationSeconds,
    publicAreaIndex: areaIndex,
    publicAreaLabel: input.areaLabel,
    publicLatitude: pubLat,
    publicLongitude: pubLng,
    createdAt: input.createdAt,
  };
}

export const seedSoundPosts: SeedSoundPost[] = seedInputs.map(buildSeedPost);

/**
 * Group seed posts by their public area index for rendering clusters.
 */
export function getSeedAreaGroups(): Map<string, SeedSoundPost[]> {
  const groups = new Map<string, SeedSoundPost[]>();
  for (const post of seedSoundPosts) {
    const existing = groups.get(post.publicAreaIndex) || [];
    existing.push(post);
    groups.set(post.publicAreaIndex, existing);
  }
  return groups;
}
