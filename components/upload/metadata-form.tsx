"use client";

import { siteConfig } from "@/lib/config/site";
import { formatDuration } from "@/lib/utils/format";

interface MetadataFormProps {
  title: string;
  note: string;
  onTitleChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  error: string | null;
  file: File | null;
  duration: number;
}

export function MetadataForm({
  title,
  note,
  onTitleChange,
  onNoteChange,
  onBack,
  onSubmit,
  error,
  file,
  duration,
}: MetadataFormProps) {
  const titleValid = title.trim().length > 0;
  const titleAtLimit =
    title.length > siteConfig.validation.maxTitleLength;
  const noteAtLimit =
    note.length > siteConfig.validation.maxNoteLength;
  const canSubmit = titleValid && !titleAtLimit && !noteAtLimit;

  return (
    <div className="space-y-5">
      {/* File summary */}
      {file && (
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
              {file.name}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {formatDuration(Math.round(duration))} &middot;{" "}
              {(file.size / 1024).toFixed(0)}KB
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={siteConfig.validation.maxTitleLength + 10}
          placeholder="Morning pigeons under the bridge"
          className="
            w-full px-3 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-bg-elevated)]
            text-[14px] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)]
            transition-colors
          "
        />
        <div className="flex justify-between mt-1">
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            Give your sound a short, descriptive title.
          </p>
          <p
            className={`text-[11px] ${
              titleAtLimit
                ? "text-red-500"
                : "text-[var(--color-text-tertiary)]"
            }`}
          >
            {title.length}/{siteConfig.validation.maxTitleLength}
          </p>
        </div>
      </div>

      {/* Note */}
      <div>
        <label
          htmlFor="note"
          className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5"
        >
          Note{" "}
          <span className="font-normal text-[var(--color-text-tertiary)]">
            (optional)
          </span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          maxLength={siteConfig.validation.maxNoteLength + 10}
          rows={3}
          placeholder="What were you hearing? What made this moment worth capturing?"
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
        <div className="flex justify-end mt-1">
          <p
            className={`text-[11px] ${
              noteAtLimit
                ? "text-red-500"
                : "text-[var(--color-text-tertiary)]"
            }`}
          >
            {note.length}/{siteConfig.validation.maxNoteLength}
          </p>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            text-[14px] text-[var(--color-text-secondary)]
            hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
            transition-colors
          "
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--color-accent)] text-[var(--color-text-inverse)]
            text-[14px] font-medium
            hover:bg-[var(--color-accent-hover)]
            disabled:opacity-50
            transition-colors
          "
        >
          Upload sound
        </button>
      </div>
    </div>
  );
}
