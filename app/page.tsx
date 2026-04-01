import { MapView } from "@/components/map/map-view";
import type { AreaGroup, AreaSound } from "@/components/map/map-view";
import { getAreaGroups } from "@/lib/data/sounds";
import { getSeedAreaGroups } from "@/lib/data/seed";

export const dynamic = "force-dynamic";

export default async function Home() {
  let areaGroups: AreaGroup[];

  // Use real data if Supabase is configured, otherwise fall back to seed data
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const groups = await getAreaGroups();
    areaGroups = Array.from(groups.entries()).map(([areaIndex, sounds]) => ({
      areaIndex,
      label: sounds[0]?.public_area_label || null,
      count: sounds.length,
      sounds: sounds.map(
        (s): AreaSound => ({
          id: s.id,
          title: s.title,
          note: s.note,
          audioPath: s.audio_path,
          durationSeconds: s.duration_seconds,
          publicAreaLabel: s.public_area_label,
          createdAt: s.created_at,
          username: s.profiles.username,
          displayName: s.profiles.display_name,
        })
      ),
    }));
  } else {
    // Seed data fallback for development without Supabase
    const groups = getSeedAreaGroups();
    areaGroups = Array.from(groups.entries()).map(([areaIndex, sounds]) => ({
      areaIndex,
      label: sounds[0]?.publicAreaLabel || null,
      count: sounds.length,
      sounds: sounds.map(
        (s): AreaSound => ({
          id: s.id,
          title: s.title,
          note: s.note,
          audioPath: "",
          durationSeconds: s.durationSeconds,
          publicAreaLabel: s.publicAreaLabel,
          createdAt: s.createdAt,
          username: s.username,
          displayName: s.displayName,
        })
      ),
    }));
  }

  return <MapView areaGroups={areaGroups} />;
}
