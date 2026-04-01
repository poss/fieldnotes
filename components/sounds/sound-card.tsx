"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { AreaSound } from "@/components/map/map-view";
import { formatDuration, formatRelativeDate } from "@/lib/utils/format";
import { getAudioUrl } from "@/lib/supabase/storage";

interface SoundCardProps {
  sound: AreaSound;
}

export function SoundCard({ sound }: SoundCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const hasAudio = !!sound.audioPath;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      if (audio && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    }
    function onEnded() {
      setIsPlaying(false);
      setProgress(0);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="group rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={!hasAudio}
          className="
            mt-0.5 flex-shrink-0
            w-9 h-9 rounded-full
            flex items-center justify-center
            bg-[var(--color-accent-soft)]
            text-[var(--color-accent)]
            hover:bg-[var(--color-accent)] hover:text-[var(--color-text-inverse)]
            disabled:opacity-40 disabled:cursor-default disabled:hover:bg-[var(--color-accent-soft)] disabled:hover:text-[var(--color-accent)]
            transition-colors duration-200
          "
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="1" width="3" height="10" rx="1" />
              <rect x="7" y="1" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 1.5v9l7.5-4.5L3 1.5z" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/sounds/${sound.id}`}
            className="text-[14px] font-medium text-[var(--color-text-primary)] leading-snug hover:text-[var(--color-accent)] transition-colors"
          >
            {sound.title}
          </Link>
          {sound.note && (
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 leading-relaxed line-clamp-2">
              {sound.note}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--color-text-tertiary)]">
            <Link
              href={`/u/${sound.username}`}
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {sound.displayName || sound.username}
            </Link>
            <span>&middot;</span>
            <span>{formatDuration(sound.durationSeconds)}</span>
            <span>&middot;</span>
            <span>{formatRelativeDate(sound.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isPlaying && (
        <div className="mt-3 h-0.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Hidden audio element */}
      {hasAudio && (
        <audio ref={audioRef} src={getAudioUrl(sound.audioPath)} preload="none" />
      )}
    </div>
  );
}
