"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "Inappropriate content",
  "Copyright violation",
  "Spam or advertising",
  "Privacy concern",
  "Other",
];

interface ReportFormProps {
  soundId: string;
}

export function ReportForm({ soundId }: ReportFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase
      .from("sound_reports")
      .insert({
        sound_post_id: soundId,
        reporter_user_id: user?.id || null,
        reason,
        details: details.trim() || null,
      });

    if (insertError) {
      setError("Could not submit report. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-[14px] text-[var(--color-text-primary)] font-medium">
          Report submitted.
        </p>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2">
          Thank you for helping keep FieldNotes safe.
        </p>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
          Reports are reviewed manually. We&apos;ll take action if the content violates our guidelines.
        </p>
        <Link
          href="/"
          className="
            inline-block mt-6 px-5 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--color-accent)] text-[var(--color-text-inverse)]
            text-[14px] font-medium
            hover:bg-[var(--color-accent-hover)] transition-colors
          "
        >
          Back to map
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Reason */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
          Reason
        </label>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label
              key={r}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
                border cursor-pointer transition-colors
                ${
                  reason === r
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                }
              `}
            >
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="sr-only"
              />
              <div
                className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${
                    reason === r
                      ? "border-[var(--color-accent)]"
                      : "border-[var(--color-border)]"
                  }
                `}
              >
                {reason === r && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                )}
              </div>
              <span className="text-[14px] text-[var(--color-text-primary)]">
                {r}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <label
          htmlFor="details"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Details{" "}
          <span className="font-normal text-[var(--color-text-tertiary)]">
            (optional)
          </span>
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Any additional context"
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors resize-none
          "
        />
      </div>

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <div className="flex gap-3">
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
          Cancel
        </Link>
        <button
          type="submit"
          disabled={!reason || submitting}
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--color-accent)] text-[var(--color-text-inverse)]
            text-[14px] font-medium
            hover:bg-[var(--color-accent-hover)]
            disabled:opacity-50
            transition-colors
          "
        >
          {submitting ? "Submitting..." : "Submit report"}
        </button>
      </div>
    </form>
  );
}
