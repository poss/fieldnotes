"use client";

import { useState } from "react";
import { MapShell } from "./map-shell";
import { AreaSheet } from "@/components/sounds/area-sheet";
import { AuthButton } from "@/components/auth/auth-button";

/** A sound item for display in the area sheet */
export interface AreaSound {
  id: string;
  title: string;
  note: string | null;
  audioPath: string;
  durationSeconds: number;
  publicAreaLabel: string | null;
  createdAt: string;
  username: string;
  displayName: string | null;
}

/** A group of sounds in an area, used by the map and sheet */
export interface AreaGroup {
  areaIndex: string;
  label: string | null;
  count: number;
  sounds: AreaSound[];
}

interface MapViewProps {
  areaGroups: AreaGroup[];
}

export function MapView({ areaGroups }: MapViewProps) {
  const [selectedArea, setSelectedArea] = useState<AreaGroup | null>(null);

  return (
    <div className="relative w-full" style={{ height: "100dvh" }}>
      {/* Floating header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="pointer-events-auto">
            <h1 className="text-[15px] font-medium tracking-tight text-[var(--color-text-primary)]">
              FieldNotes
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] tracking-wide">
              Listen to places.
            </p>
          </div>
          <div className="pointer-events-auto">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Map */}
      <MapShell
        areaGroups={areaGroups}
        onAreaSelect={(group) => setSelectedArea(group)}
      />

      {/* Area detail sheet */}
      <AreaSheet
        area={selectedArea}
        onClose={() => setSelectedArea(null)}
      />
    </div>
  );
}
