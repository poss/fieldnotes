"use client";

import { useState, useRef, useCallback } from "react";
import { siteConfig } from "@/lib/config/site";
import { formatDuration } from "@/lib/utils/format";

interface FilePickerProps {
  onFileSelected: (file: File, duration: number) => void;
}

export function FilePicker({ onFileSelected }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validateAndSelect = useCallback(
    async (file: File) => {
      setError(null);
      setChecking(true);

      // Check format
      const acceptedFormats: readonly string[] = siteConfig.upload.acceptedFormats;
      const acceptedExtensions: readonly string[] = siteConfig.upload.acceptedExtensions;
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (
        !acceptedFormats.includes(file.type) &&
        !acceptedExtensions.includes(ext)
      ) {
        setError(
          `Unsupported format. Please use ${acceptedExtensions.join(", ")}.`
        );
        setChecking(false);
        return;
      }

      // Check size
      const maxBytes = siteConfig.upload.maxFileSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(
          `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${siteConfig.upload.maxFileSizeMB}MB.`
        );
        setChecking(false);
        return;
      }

      // Check duration
      try {
        const duration = await getAudioDuration(file);
        if (duration > siteConfig.upload.maxDurationSeconds) {
          setError(
            `Clip is too long (${formatDuration(Math.round(duration))}). Maximum is ${formatDuration(siteConfig.upload.maxDurationSeconds)}.`
          );
          setChecking(false);
          return;
        }

        setChecking(false);
        onFileSelected(file, duration);
      } catch {
        setError("Could not read audio file. Please try a different file.");
        setChecking(false);
      }
    },
    [onFileSelected]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          cursor-pointer rounded-xl border-2 border-dashed
          p-10 text-center transition-colors
          ${
            dragOver
              ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
              : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={siteConfig.upload.acceptedFormats.join(",")}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {/* Audio icon */}
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--color-accent)]"
            >
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>

          {checking ? (
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              Checking file...
            </p>
          ) : (
            <>
              <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                Choose an audio file
              </p>
              <p className="text-[12px] text-[var(--color-text-tertiary)]">
                or drag and drop here
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-[13px] text-red-600">{error}</p>
      )}

      <div className="mt-4 space-y-1 text-[12px] text-[var(--color-text-tertiary)]">
        <p>Max {siteConfig.upload.maxDurationSeconds} seconds, {siteConfig.upload.maxFileSizeMB}MB</p>
        <p>Formats: {siteConfig.upload.acceptedExtensions.join(", ")}</p>
        <p className="mt-3 text-[11px]">
          Capture a moment in sound. Prefer ambient recordings.
          Avoid copyrighted music and private conversations.
        </p>
      </div>
    </div>
  );
}

/** Read audio duration by loading into an Audio element */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout reading audio duration"));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      URL.revokeObjectURL(url);
    }

    function onLoaded() {
      cleanup();
      resolve(audio.duration);
    }

    function onError() {
      cleanup();
      reject(new Error("Failed to read audio file"));
    }

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = url;
  });
}
