"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors
          "
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-[var(--color-text-secondary)]"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors
          "
          placeholder="Your password"
        />
      </div>

      {error && (
        <p className="text-[13px] text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-2.5 rounded-[var(--radius-md)]
          bg-[var(--color-accent)] text-[var(--color-text-inverse)]
          text-[14px] font-medium
          hover:bg-[var(--color-accent-hover)]
          disabled:opacity-50
          transition-colors
        "
      >
        {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Logging in…
        </span>
      ) : "Log in"}
      </button>

      <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
