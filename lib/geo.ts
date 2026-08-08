import type { Cafe } from "./types";

/** A point on the map. */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Great-circle (haversine) distance in metres. Straight-line is plenty here —
 * we're ranking a handful of cafés in one city, not routing between them.
 */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The café's position, or null when it hasn't been pinned yet. */
export function cafePosition(cafe: Cafe): LatLng | null {
  return typeof cafe.lat === "number" && typeof cafe.lng === "number"
    ? { lat: cafe.lat, lng: cafe.lng }
    : null;
}

/** How far a café is from a point, or null if it has no pin. */
export function cafeDistance(cafe: Cafe, from: LatLng | null): number | null {
  if (!from) return null;
  const pos = cafePosition(cafe);
  return pos ? distanceMeters(from, pos) : null;
}

/** "450 m" for close by, "1.2 km" further out. */
export function formatDistance(metres: number): string {
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;
}

/**
 * Ask the browser where the visitor is. Rejects with a message worth showing:
 * a dead end like "couldn't get your location" is no help when the real
 * problem is a denied permission or an insecure origin.
 *
 * Coarse accuracy on purpose — desktops have no GPS and phones are slow to
 * fix one, and wifi/IP level is plenty for "which café is closest".
 */
export function requestPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location isn't available in this browser."));
      return;
    }
    if (!window.isSecureContext) {
      reject(new Error("Location needs a secure (https) connection."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? "Location blocked — allow it for this site to sort by distance."
              : err.code === err.TIMEOUT
                ? "Location timed out — try again."
                : "Couldn't get your location.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  });
}
