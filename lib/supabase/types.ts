export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoundPost {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  audio_path: string;
  duration_seconds: number;
  capture_latitude: number;
  capture_longitude: number;
  public_area_index: string;
  public_area_label: string | null;
  public_latitude: number;
  public_longitude: number;
  location_source: "device" | "manual";
  recorded_at: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "hidden" | "pending" | "removed";
  is_public: boolean;
}

/** Public-safe sound post — excludes exact capture coordinates */
export interface PublicSoundPost {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  audio_path: string;
  duration_seconds: number;
  public_area_index: string;
  public_area_label: string | null;
  public_latitude: number;
  public_longitude: number;
  location_source: "device" | "manual";
  recorded_at: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "hidden" | "pending" | "removed";
  is_public: boolean;
}

/** PublicSoundPost with joined profile data for display */
export interface SoundPostWithProfile extends PublicSoundPost {
  profiles: Pick<Profile, "username" | "display_name" | "avatar_url">;
}

export interface SoundReport {
  id: string;
  sound_post_id: string;
  reporter_user_id: string | null;
  reason: string;
  details: string | null;
  created_at: string;
}
