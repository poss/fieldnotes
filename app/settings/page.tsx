import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/data/profiles";
import { SettingsForm } from "@/components/profile/settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(user.id);
  if (!profile) redirect("/login");

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <div className="sticky top-0 z-10 bg-[var(--color-bg-overlay)] backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
        <div className="max-w-lg mx-auto px-5 py-4">
          <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Settings
          </h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 py-8">
        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
