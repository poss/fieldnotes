"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { siteConfig } from "@/lib/config/site";
import { coordsToAreaIndex, areaIndexToGeoJSON } from "@/lib/geo/area";

interface LocationPickerProps {
  onConfirm: (lat: number, lng: number, source: "device" | "manual") => void;
  onBack: () => void;
}

export function LocationPicker({ onConfirm, onBack }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [locationSource, setLocationSource] = useState<"device" | "manual">(
    "manual"
  );
  const [areaLabel, setAreaLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Update the area overlay when the map moves
  const updateArea = useCallback((map: maplibregl.Map) => {
    const center = map.getCenter();
    const areaIndex = coordsToAreaIndex(center.lat, center.lng);
    const polygon = areaIndexToGeoJSON(areaIndex);

    const source = map.getSource("upload-area") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [polygon],
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: siteConfig.map.tileStyle,
      center: siteConfig.map.defaultCenter,
      zoom: 14,
      attributionControl: {},
      pitchWithRotate: false,
      dragRotate: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add area preview layer
      map.addSource("upload-area", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [[]] },
        },
      });

      map.addLayer({
        id: "upload-area-fill",
        type: "fill",
        source: "upload-area",
        paint: {
          "fill-color": "rgba(139, 115, 85, 0.12)",
          "fill-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "upload-area-border",
        type: "line",
        source: "upload-area",
        paint: {
          "line-color": "rgba(139, 115, 85, 0.4)",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });

      // Compute initial area
      updateArea(map);
      setReady(true);

      // Update area on map move
      map.on("moveend", () => updateArea(map));

      // Try to get device location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 15 });
            setLocationSource("device");
          },
          () => {
            // Geolocation denied or failed — stay on default center
            setLocationSource("manual");
          },
          { timeout: 8000, maximumAge: 60000 }
        );
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [updateArea]);

  function handleConfirm() {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    onConfirm(center.lat, center.lng, locationSource);
  }

  return (
    <div>
      {/* Map container with reticle */}
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: "50vh", minHeight: 320 }}>
        <div ref={containerRef} className="absolute inset-0" />

        {/* Fixed center reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center">
            {/* Pin */}
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
              <path
                d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z"
                fill="var(--color-accent)"
                fillOpacity="0.85"
              />
              <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.9" />
            </svg>
            {/* Shadow dot */}
            <div className="w-2 h-1 bg-black/20 rounded-full -mt-0.5" />
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-4 space-y-1">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Drag the map to adjust the location.
        </p>
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          Only the general area will be shown publicly.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
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
          onClick={handleConfirm}
          disabled={!ready}
          className="
            flex-1 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--color-accent)] text-[var(--color-text-inverse)]
            text-[14px] font-medium
            hover:bg-[var(--color-accent-hover)]
            disabled:opacity-50
            transition-colors
          "
        >
          Confirm location
        </button>
      </div>
    </div>
  );
}
