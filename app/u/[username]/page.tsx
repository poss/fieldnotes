import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/data/profiles";
import { getSoundsByUser } from "@/lib/data/sounds";
import { ProfileView } from "@/components/profile/profile-view";
import { siteConfig } from "@/lib/config/site";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "User not found" };

  return {
    title: profile.display_name || profile.username,
    description: profile.bio || `${profile.username} on ${siteConfig.name}`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const sounds = await getSoundsByUser(profile.id);

  let isOwnProfile = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isOwnProfile = user?.id === profile.id;
  }

  return <ProfileView profile={profile} sounds={sounds} isOwnProfile={isOwnProfile} />;
}
