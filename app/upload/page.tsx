import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { UploadFlow } from "@/components/upload/upload-flow";

export const metadata: Metadata = {
  title: "Upload",
};

export default async function UploadPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <UploadFlow userId={user.id} />;
}
