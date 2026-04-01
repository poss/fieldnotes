import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-5 py-12 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
              {siteConfig.name}
            </h1>
          </Link>
          <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">
            {siteConfig.tagline}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
