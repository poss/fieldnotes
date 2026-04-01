"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { coordsToAreaIndex, areaIndexToCenter } from "@/lib/geo/area";
import {
  validateTitle,
  validateNote,
  validateDuration,
  validateCoordinates,
} from "@/lib/validation/sound";

const MAX_UPLOADS_PER_DAY = 10;

interface CreateSoundInput {
  userId: string;
  title: string;
  note: string;
  audioPath: string;
  durationSeconds: number;
  captureLat: number;
  captureLng: number;
  locationSource: "device" | "manual";
}

interface CreateSoundResult {
  success: boolean;
  soundId?: string;
  error?: string;
}

export async function createSoundPost(
  input: CreateSoundInput
): Promise<CreateSoundResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Server is not configured." };
  }

  // Validate all fields server-side
  const titleError = validateTitle(input.title);
  if (titleError) return { success: false, error: titleError.message };

  const noteError = validateNote(input.note);
  if (noteError) return { success: false, error: noteError.message };

  const durationError = validateDuration(input.durationSeconds);
  if (durationError) return { success: false, error: durationError.message };

  const coordError = validateCoordinates(input.captureLat, input.captureLng);
  if (coordError) return { success: false, error: coordError.message };

  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== input.userId) {
    return { success: false, error: "Not authenticated." };
  }

  // Rate limit: max uploads per 24 hours
  const { count, error: countError } = await supabase
    .from("sound_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (!countError && count !== null && count >= MAX_UPLOADS_PER_DAY) {
    return {
      success: false,
      error: `You've reached the upload limit (${MAX_UPLOADS_PER_DAY} per day). Try again tomorrow.`,
    };
  }

  // Compute public area
  const areaIndex = coordsToAreaIndex(input.captureLat, input.captureLng);
  const [publicLat, publicLng] = areaIndexToCenter(areaIndex);

  // Insert
  const { data, error: insertError } = await supabase
    .from("sound_posts")
    .insert({
      user_id: input.userId,
      title: input.title.trim(),
      note: input.note.trim() || null,
      audio_path: input.audioPath,
      duration_seconds: Math.round(input.durationSeconds),
      capture_latitude: input.captureLat,
      capture_longitude: input.captureLng,
      public_area_index: areaIndex,
      public_latitude: publicLat,
      public_longitude: publicLng,
      location_source: input.locationSource,
    })
    .select("id")
    .single();

  if (insertError) {
    return { success: false, error: "Failed to save. Please try again." };
  }

  return { success: true, soundId: data.id };
}
