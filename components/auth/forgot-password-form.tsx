"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[14px] text-[var(--color-text-primary)] font-medium">
          Check your email.
        </p>
        <p className="text-[13px] text-[var(--color-text-tertiary)]">
          We sent a password reset link to {email}.
        </p>
        <Link
          href="/login"
          className="inline-block text-[13px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          Back to log in
        </Link>
      </div>
    );
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

      {error && <p className="text-[13px] text-red-600">{error}</p>}

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
            Sending…
          </span>
        ) : "Send reset link"}
      </button>

      <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
        <Link
          href="/login"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
