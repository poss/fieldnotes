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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const dragFromScroll = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    if (area) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [area]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onCloseRef.current();
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
  }, [area]);

  // Reset drag offset when area changes
  useEffect(() => {
    setDragOffset(0);
  }, [area]);

  // Touch drag-to-dismiss — works on handle and on scroll content when at top
  const startDrag = useCallback((clientY: number, fromScroll = false) => {
    dragStartY.current = clientY;
    isDragging.current = true;
    dragFromScroll.current = fromScroll;
  }, []);

  const moveDrag = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const delta = clientY - dragStartY.current;
    if (delta > 0) setDragOffset(delta);
  }, []);

  const endDrag = useCallback((currentOffset: number) => {
    isDragging.current = false;
    dragFromScroll.current = false;
    if (currentOffset > DISMISS_THRESHOLD) {
      onCloseRef.current();
    }
    setDragOffset(0);
  }, []);

  // Handle — always draggable
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startDrag(e.touches[0].clientY);
  }, [startDrag]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) {
      e.preventDefault();
      setDragOffset(delta);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const offset = e.changedTouches[0].clientY - dragStartY.current;
    endDrag(Math.max(0, offset));
  }, [endDrag]);

  // Scroll content — only drag when already at top
  const scrollTouchStart = useCallback((e: React.TouchEvent) => {
    const atTop = (scrollRef.current?.scrollTop ?? 0) === 0;
    if (atTop) startDrag(e.touches[0].clientY, true);
  }, [startDrag]);

  const scrollTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !dragFromScroll.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) {
      // Prevent scroll bounce and move the sheet instead
      e.preventDefault();
      setDragOffset(delta);
    } else {
      // User is scrolling up — hand off to native scroll
      isDragging.current = false;
      setDragOffset(0);
    }
  }, []);

  const scrollTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragFromScroll.current) return;
    const offset = e.changedTouches[0].clientY - dragStartY.current;
    endDrag(Math.max(0, offset));
  }, [endDrag]);

  const sheetStyle = dragOffset > 0
    ? { transform: `translateY(${dragOffset}px)`, transition: "none" }
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
        <div
          ref={scrollRef}
          onTouchStart={scrollTouchStart}
          onTouchMove={scrollTouchMove}
          onTouchEnd={scrollTouchEnd}
          className="overflow-y-auto px-5 pb-5 space-y-3"
        >
          {area?.sounds.map((sound) => (
            <SoundCard key={sound.id} sound={sound} />
          ))}
        </div>
      </div>
    </div>
  );
}
