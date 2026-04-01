"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config/site";
import type { Profile } from "@/lib/supabase/types";

interface SettingsFormProps {
  profile: Profile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Username (read-only) */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
          Username
        </label>
        <p className="px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-bg)] text-[14px] text-[var(--color-text-tertiary)]">
          @{profile.username}
        </p>
      </div>

      {/* Display name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={siteConfig.validation.maxUsernameLength}
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors
          "
          placeholder="Your name"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={siteConfig.validation.maxBioLength}
          rows={3}
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors resize-none
          "
          placeholder="A short bio"
        />
        <p className="text-right mt-1 text-[11px] text-[var(--color-text-tertiary)]">
          {bio.length}/{siteConfig.validation.maxBioLength}
        </p>
      </div>

      {error && <p className="text-[13px] text-red-600">{error}</p>}
      {saved && (
        <p className="text-[13px] text-green-600">Saved.</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/"
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)] text-center
            border border-[var(--color-border)]
            text-[14px] text-[var(--color-text-secondary)]
            hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
            transition-colors
          "
        >
          Back to map
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--color-accent)] text-[var(--color-text-inverse)]
            text-[14px] font-medium
            hover:bg-[var(--color-accent-hover)]
            disabled:opacity-50
            transition-colors
          "
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Sign out */}
      <div className="pt-6 border-t border-[var(--color-border-subtle)]">
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[13px] text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
        >
          Log out
        </button>
      </div>
    </form>
  );
}
