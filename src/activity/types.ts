import type { ActivityIntensity, ActivityLogResponseDto, ActivityType } from "@/api/generated";

import type activityEn from "./locales/en.json";

/** Recursively extracts every leaf dot-path key from the "activity" translation JSON. */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${DotPaths<T[K]>}`
      : never;
}[keyof T & string];

export type ActivityTranslationKey = DotPaths<typeof activityEn>;

/** A coordinate decoded out of the API's string `location` field. */
export type ActivityCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * What the API's single nullable `location` string decodes to. `label` is the
 * human-readable part and may be empty; `coordinates` is null whenever the
 * stored string carries no parseable coordinate suffix.
 */
export type ActivityLocation = {
  label: string;
  coordinates: ActivityCoordinates | null;
};

/**
 * Flattened row model for the virtualized activity list: day headers and activity
 * entries share one FlatList data array. A discriminated union keeps `renderItem`
 * type-safe without a cast.
 */
export type ActivityListRow =
  | { kind: "header"; key: string; dayIso: string }
  | { kind: "activity"; key: string; activity: ActivityLogResponseDto };

/** Client-side filters — the API only supports `from`/`to`/`source` server-side. */
export type ActivityFilters = {
  types: ActivityType[];
  intensities: ActivityIntensity[];
};
