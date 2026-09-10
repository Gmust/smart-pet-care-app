import type { ActivityCoordinates, ActivityLocation } from "../types";

/**
 * The API stores `location` as one nullable string with no coordinate fields, so
 * coordinates ride along in a suffix:
 *
 *   "Riverside Park@50.450100,30.523400"  label + coordinates
 *   "@50.450100,30.523400"                coordinates, no label
 *   "Riverside Park"                      label only (and anything unrecognized)
 *
 * ponytail: client-side convention the backend neither validates nor understands.
 * Migrate to real `latitude`/`longitude` fields once the API exposes them; until
 * then the decoder tolerates any string so a value written by another client (or
 * a backend that later assigns `location` its own meaning) still reads as a label.
 */

/** ~0.1 m — far finer than a tapped map point needs, and it keeps length stable. */
const COORDINATE_PRECISION = 6;

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

const isValidLatitude = (value: number): boolean => isFiniteNumber(value) && Math.abs(value) <= 90;

const isValidLongitude = (value: number): boolean =>
  isFiniteNumber(value) && Math.abs(value) <= 180;

export const encodeActivityLocation = (location: ActivityLocation | null): string | null => {
  if (!location) return null;

  const label = location.label.trim();
  const { coordinates } = location;

  if (!coordinates) return label || null;
  if (!isValidLatitude(coordinates.latitude) || !isValidLongitude(coordinates.longitude)) {
    return label || null;
  }

  const latitude = coordinates.latitude.toFixed(COORDINATE_PRECISION);
  const longitude = coordinates.longitude.toFixed(COORDINATE_PRECISION);

  return `${label}@${latitude},${longitude}`;
};

export const decodeActivityLocation = (raw: string | null | undefined): ActivityLocation | null => {
  if (raw == null) return null;

  const value = raw.trim();
  if (!value) return null;

  // Split on the LAST "@" so labels may themselves contain "@".
  const separatorIndex = value.lastIndexOf("@");
  if (separatorIndex === -1) return { label: value, coordinates: null };

  const label = value.slice(0, separatorIndex).trim();
  const suffix = value.slice(separatorIndex + 1);
  const parts = suffix.split(",");

  if (parts.length !== 2) return { label: value, coordinates: null };

  const latitude = Number(parts[0]);
  const longitude = Number(parts[1]);

  // A blank part coerces to 0 rather than NaN, so reject blanks explicitly.
  const hasNumericParts = parts.every((part) => part.trim() !== "");

  if (!hasNumericParts || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    // Unparseable suffix — the whole value degrades to a plain label, silently.
    return { label: value, coordinates: null };
  }

  const coordinates: ActivityCoordinates = { latitude, longitude };
  return { label, coordinates };
};
