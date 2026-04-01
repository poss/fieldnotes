import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Fetch a profile by username.
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Fetch a profile by user ID.
 */
export async function getProfileById(
  id: string
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}
