import Link from "next/link";
import type { Profile, SoundPostWithProfile } from "@/lib/supabase/types";
import { SoundCard } from "@/components/sounds/sound-card";
import type { AreaSound } from "@/components/map/map-view";

interface ProfileViewProps {
  profile: Profile;
  sounds: SoundPostWithProfile[];
  isOwnProfile?: boolean;
}

function toAreaSound(s: SoundPostWithProfile): AreaSound {
  return {
    id: s.id,
    title: s.title,
    note: s.note,
    audioPath: s.audio_path,
    durationSeconds: s.duration_seconds,
    publicAreaLabel: s.public_area_label,
    createdAt: s.created_at,
    username: s.profiles.username,
    displayName: s.profiles.display_name,
  };
}

export function ProfileView({ profile, sounds, isOwnProfile }: ProfileViewProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg-overlay)] backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
        <div className="max-w-lg mx-auto px-5 py-4">
          <Link
            href="/"
            className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            &larr; Map
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Profile info */}
        <div className="mb-8">
          {/* Avatar placeholder */}
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
            <span className="text-lg font-medium text-[var(--color-accent)]">
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </span>
          </div>

          <h1 className="text-lg font-medium text-[var(--color-text-primary)]">
            {profile.display_name || profile.username}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              @{profile.username}
            </p>
            {isOwnProfile && (
              <Link
                href="/settings"
                className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
              >
                Edit profile
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}

          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-3">
            Member since {memberSince}
          </p>
        </div>

        {/* Sounds */}
        <div>
          <h2 className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-4">
            {sounds.length === 0
              ? "No sounds yet"
              : sounds.length === 1
                ? "1 sound"
                : `${sounds.length} sounds`}
          </h2>
          <div className="space-y-3">
            {sounds.map((sound) => (
              <SoundCard key={sound.id} sound={toAreaSound(sound)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
