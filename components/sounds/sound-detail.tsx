"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { SoundPostWithProfile } from "@/lib/supabase/types";
import { getAudioUrl } from "@/lib/supabase/storage";
import { formatDuration, formatRelativeDate } from "@/lib/utils/format";
import { generateWaveform } from "@/lib/utils/waveform";

interface SoundDetailProps {
  sound: SoundPostWithProfile;
}

export function SoundDetail({ sound }: SoundDetailProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      if (audio && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    }
    function onEnded() {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
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

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    audio.currentTime = fraction * audio.duration;
  }

  const profile = sound.profiles;

  const DETAIL_BARS = 80;
  const waveform = useMemo(() => generateWaveform(sound.id, DETAIL_BARS), [sound.id]);

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg-overlay)] backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            &larr; Map
          </Link>
          <Link
            href={`/report/${sound.id}`}
            className="text-[11px] text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
          >
            Report
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Title */}
        <h1 className="text-xl font-medium text-[var(--color-text-primary)] leading-snug">
          {sound.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3 text-[13px] text-[var(--color-text-tertiary)]">
          <Link
            href={`/u/${profile.username}`}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            {profile.display_name || profile.username}
          </Link>
          <span>&middot;</span>
          <span>{formatRelativeDate(sound.created_at)}</span>
          {sound.public_area_label && (
            <>
              <span>&middot;</span>
              <span>{sound.public_area_label}</span>
            </>
          )}
        </div>

        {/* Player */}
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="
                w-14 h-14 rounded-full flex-shrink-0
                flex items-center justify-center
                bg-[var(--color-accent)]
                text-[var(--color-text-inverse)]
                hover:bg-[var(--color-accent-hover)]
                transition-colors
              "
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="1" width="3" height="10" rx="1" />
                  <rect x="7" y="1" width="3" height="10" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 1.5v9l7.5-4.5L3 1.5z" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              {/* Waveform */}
              <div
                onClick={handleProgressClick}
                className="relative h-16 w-full flex items-end gap-[1px] cursor-pointer overflow-hidden rounded-sm"
              >
                {waveform.map((barHeight, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-colors duration-75"
                    style={{
                      height: `${barHeight * 100}%`,
                      backgroundColor:
                        i / DETAIL_BARS < progress
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                    }}
                  />
                ))}
                {/* Playhead cursor */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-[var(--color-accent)] opacity-60 pointer-events-none"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                <span>{formatDuration(Math.round(currentTime))}</span>
                <span>{formatDuration(sound.duration_seconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        {sound.note && (
          <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {sound.note}
            </p>
          </div>
        )}

        {/* Hidden audio */}
        <audio ref={audioRef} src={getAudioUrl(sound.audio_path)} preload="metadata" />
      </div>
    </div>
  );
}
