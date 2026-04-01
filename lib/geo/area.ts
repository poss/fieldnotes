import { latLngToCell, cellToLatLng, cellToBoundary } from "h3-js";
import { siteConfig } from "@/lib/config/site";

/**
 * Convert exact coordinates to a public H3 area index.
 * The resolution is set in site config — resolution 7 gives ~1.2km² hexagons,
 * roughly neighborhood-sized, which balances usability with privacy.
 */
export function coordsToAreaIndex(lat: number, lng: number): string {
  return latLngToCell(lat, lng, siteConfig.map.publicAreaResolution);
}

/**
 * Get the center point of an H3 cell — used as the public display coordinate.
 */
export function areaIndexToCenter(h3Index: string): [number, number] {
  const [lat, lng] = cellToLatLng(h3Index);
  return [lat, lng];
}

/**
 * Get the boundary polygon of an H3 cell for rendering on a map.
 * Returns an array of [lat, lng] pairs.
 */
export function areaIndexToBoundary(
  h3Index: string
): [number, number][] {
  return cellToBoundary(h3Index);
}

/**
 * Convert H3 boundary to GeoJSON-compatible [lng, lat] polygon coordinates.
 */
export function areaIndexToGeoJSON(h3Index: string): [number, number][] {
  const boundary = cellToBoundary(h3Index);
  // H3 returns [lat, lng], GeoJSON needs [lng, lat]
  const coords = boundary.map(([lat, lng]) => [lng, lat] as [number, number]);
  // Close the polygon
  coords.push(coords[0]);
  return coords;
}
