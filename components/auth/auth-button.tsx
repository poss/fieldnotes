"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfiguredClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // Hide auth UI entirely when Supabase is not configured
  if (!isSupabaseConfiguredClient()) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="
          px-3 py-1.5 rounded-[var(--radius-full)]
          text-[12px] font-medium
          text-[var(--color-text-secondary)]
          bg-[var(--color-bg-elevated)]
          border border-[var(--color-border)]
          hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
          shadow-[var(--shadow-sm)]
          transition-colors
        "
      >
        Log in
      </Link>
    );
  }

  const username = user.user_metadata?.username || "user";

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="
          px-3 py-1.5 rounded-[var(--radius-full)]
          text-[12px] font-medium
          text-[var(--color-text-secondary)]
          bg-[var(--color-bg-elevated)]
          border border-[var(--color-border)]
          hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
          shadow-[var(--shadow-sm)]
          transition-colors
        "
      >
        {username}
      </button>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Dropdown */}
          <div className="
            absolute right-0 top-full mt-2 z-50
            w-44 py-1
            bg-[var(--color-bg-elevated)]
            border border-[var(--color-border)]
            rounded-[var(--radius-md)]
            shadow-[var(--shadow-md)]
          ">
            <Link
              href="/upload"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors"
            >
              Upload a sound
            </Link>
            <Link
              href={`/u/${username}`}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors"
            >
              Your profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors"
            >
              Settings
            </Link>
            <div className="border-t border-[var(--color-border-subtle)] my-1" />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
