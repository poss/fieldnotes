import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PublicSoundPost, SoundPostWithProfile } from "@/lib/supabase/types";

/**
 * Fetch all public sound posts grouped by area index.
 * Used to render activity areas on the map.
 */
export async function getAreaGroups(): Promise<
  Map<string, SoundPostWithProfile[]>
> {
  if (!isSupabaseConfigured()) return new Map();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sound_posts")
    .select(
      `
      id, user_id, title, note, audio_path, duration_seconds,
      public_area_index, public_area_label, public_latitude, public_longitude,
      location_source, recorded_at, created_at, updated_at, status, is_public,
      profiles!inner(username, display_name, avatar_url)
    `
    )
    .eq("status", "active")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error || !data) return new Map();

  const groups = new Map<string, SoundPostWithProfile[]>();
  for (const row of data as unknown as SoundPostWithProfile[]) {
    const key = row.public_area_index;
    const existing = groups.get(key) || [];
    existing.push(row);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Fetch a single sound post by ID with profile data.
 */
export async function getSoundById(
  id: string
): Promise<SoundPostWithProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sound_posts")
    .select(
      `
      id, user_id, title, note, audio_path, duration_seconds,
      public_area_index, public_area_label, public_latitude, public_longitude,
      location_source, recorded_at, created_at, updated_at, status, is_public,
      profiles!inner(username, display_name, avatar_url)
    `
    )
    .eq("id", id)
    .eq("status", "active")
    .eq("is_public", true)
    .single();

  if (error || !data) return null;
  return data as unknown as SoundPostWithProfile;
}

/**
 * Fetch all public sounds by a user.
 */
export async function getSoundsByUser(
  userId: string
): Promise<SoundPostWithProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sound_posts")
    .select(
      `
      id, user_id, title, note, audio_path, duration_seconds,
      public_area_index, public_area_label, public_latitude, public_longitude,
      location_source, recorded_at, created_at, updated_at, status, is_public,
      profiles!inner(username, display_name, avatar_url)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as SoundPostWithProfile[];
}
