"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { siteConfig } from "@/lib/config/site";
import { areaIndexToGeoJSON, areaIndexToCenter } from "@/lib/geo/area";
import type { AreaGroup } from "./map-view";

export interface MapShellProps {
  areaGroups: AreaGroup[];
  onAreaSelect: (group: AreaGroup) => void;
}

export function MapShell({ areaGroups, onAreaSelect }: MapShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const groupsRef = useRef(areaGroups);
  groupsRef.current = areaGroups;
  const onAreaSelectRef = useRef(onAreaSelect);
  onAreaSelectRef.current = onAreaSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: siteConfig.map.tileStyle,
      center: siteConfig.map.defaultCenter,
      zoom: siteConfig.map.defaultZoom,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      const features: GeoJSON.Feature[] = [];
      const pointFeatures: GeoJSON.Feature[] = [];

      for (const group of groupsRef.current) {
        const polygon = areaIndexToGeoJSON(group.areaIndex);
        const [centerLat, centerLng] = areaIndexToCenter(group.areaIndex);

        features.push({
          type: "Feature",
          properties: { areaIndex: group.areaIndex, label: group.label || "", count: group.count },
          geometry: { type: "Polygon", coordinates: [polygon] },
        });
        pointFeatures.push({
          type: "Feature",
          properties: { areaIndex: group.areaIndex, label: group.label || "", count: group.count },
          geometry: { type: "Point", coordinates: [centerLng, centerLat] },
        });
      }

      map.addSource("areas", { type: "geojson", data: { type: "FeatureCollection", features } });
      map.addLayer({
        id: "area-fills",
        type: "fill",
        source: "areas",
        paint: {
          "fill-color": "rgba(139, 115, 85, 0.12)",
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.8],
        },
      });
      map.addLayer({
        id: "area-borders",
        type: "line",
        source: "areas",
        paint: { "line-color": "rgba(139, 115, 85, 0.3)", "line-width": 1.5 },
      });

      map.addSource("area-centers", { type: "geojson", data: { type: "FeatureCollection", features: pointFeatures } });

      // Pulse ring layer — renders behind the solid dot
      map.addLayer({
        id: "area-dots-pulse",
        type: "circle",
        source: "area-centers",
        paint: {
          "circle-radius": 6,
          "circle-color": "rgba(139, 115, 85, 0)",
          "circle-stroke-color": "rgba(139, 115, 85, 0.5)",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "area-dots",
        type: "circle",
        source: "area-centers",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 1, 6, 5, 10],
          "circle-color": "rgba(139, 115, 85, 0.5)",
          "circle-stroke-color": "rgba(139, 115, 85, 0.7)",
          "circle-stroke-width": 1.5,
          "circle-blur": 0.3,
        },
      });
      map.addLayer({
        id: "area-labels",
        type: "symbol",
        source: "area-centers",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-offset": [0, 1.8],
          "text-anchor": "top",
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        },
        paint: {
          "text-color": "rgba(100, 90, 78, 0.7)",
          "text-halo-color": "rgba(255, 255, 255, 0.9)",
          "text-halo-width": 1.5,
        },
      });

      let hoveredId: string | number | null = null;
      map.on("mousemove", "area-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features?.[0]) {
          if (hoveredId !== null) map.setFeatureState({ source: "areas", id: hoveredId }, { hover: false });
          hoveredId = e.features[0].id ?? null;
          if (hoveredId !== null) map.setFeatureState({ source: "areas", id: hoveredId }, { hover: true });
        }
      });
      map.on("mouseleave", "area-fills", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== null) map.setFeatureState({ source: "areas", id: hoveredId }, { hover: false });
        hoveredId = null;
      });

      function handleClick(areaIndex: string) {
        const group = groupsRef.current.find((g) => g.areaIndex === areaIndex);
        if (group) onAreaSelectRef.current(group);
      }
      map.on("click", "area-fills", (e) => {
        const areaIndex = e.features?.[0]?.properties?.areaIndex as string;
        if (areaIndex) handleClick(areaIndex);
      });
      map.on("click", "area-dots", (e) => {
        const areaIndex = e.features?.[0]?.properties?.areaIndex as string;
        if (areaIndex) handleClick(areaIndex);
      });
      map.on("mouseenter", "area-dots", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "area-dots", () => { map.getCanvas().style.cursor = ""; });

      // Sonar ping animation
      let phase = 0;
      let animFrameId: number;
      function animatePulse() {
        phase = (phase + 0.008) % 1;
        const radius = 6 + phase * 14;
        const opacity = (1 - phase) * 0.35;
        if (map.getLayer("area-dots-pulse")) {
          map.setPaintProperty("area-dots-pulse", "circle-radius", radius);
          map.setPaintProperty("area-dots-pulse", "circle-opacity", opacity);
        }
        animFrameId = requestAnimationFrame(animatePulse);
      }
      animFrameId = requestAnimationFrame(animatePulse);

      map.once("remove", () => cancelAnimationFrame(animFrameId));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
