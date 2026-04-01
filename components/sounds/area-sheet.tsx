"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { AreaGroup } from "@/components/map/map-view";
import { SoundCard } from "./sound-card";

interface AreaSheetProps {
  area: AreaGroup | null;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 80;

export function AreaSheet({ area, onClose }: AreaSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (area) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [area, onClose]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (area) {
      const timeout = setTimeout(() => {
        document.addEventListener("click", handleClick);
      }, 100);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener("click", handleClick);
      };
    }
  }, [area, onClose]);

  // Reset drag offset when area changes
  useEffect(() => {
    setDragOffset(0);
  }, [area]);

  // Touch drag-to-dismiss on the handle area
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    // Only allow dragging down
    setDragOffset(Math.max(0, delta));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragOffset > DISMISS_THRESHOLD) {
      onClose();
    }
    setDragOffset(0);
  }, [dragOffset, onClose]);

  const sheetStyle = dragOffset > 0
    ? { transform: `translateY(${dragOffset}px)`, transition: isDragging.current ? "none" : undefined }
    : undefined;

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0 z-20
        transition-transform duration-300 ease-out
        ${area ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div
        ref={sheetRef}
        style={sheetStyle}
        className={`
          mx-auto max-w-lg
          rounded-t-2xl
          bg-[var(--color-bg-elevated)]
          shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
          border border-b-0 border-[var(--color-border-subtle)]
          max-h-[60vh] flex flex-col
          pb-[env(safe-area-inset-bottom)]
          ${dragOffset === 0 ? "transition-transform duration-200" : ""}
        `}
      >
        {/* Handle — drag target */}
        <div
          ref={handleRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-8 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 pt-1 flex items-baseline justify-between">
          <div>
            <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
              {area?.label || "This area"}
            </h2>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
              {area?.count === 1
                ? "1 sound"
                : `${area?.count || 0} sounds`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-end"
          >
            Close
          </button>
        </div>

        {/* Sound list */}
        <div className="overflow-y-auto px-5 pb-5 space-y-3">
          {area?.sounds.map((sound) => (
            <SoundCard key={sound.id} sound={sound} />
          ))}
        </div>
      </div>
    </div>
  );
}
