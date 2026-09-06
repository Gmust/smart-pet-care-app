import type { ActivityLogResponseDto } from "@/api/generated";

import type { ActivityFilters } from "../types";

/**
 * Type and intensity filtering happens here rather than server-side: the API
 * only accepts `from`, `to`, and `source` as query parameters.
 *
 * `type` and `intensity` are both nullable on the DTO. An entry whose value is
 * null cannot satisfy a filter on that field, so it drops out while that filter
 * is active — specified behavior, surfaced to the user in the filter drawer.
 */
export const filterActivities = (
  activities: ActivityLogResponseDto[] | undefined,
  filters: ActivityFilters
): ActivityLogResponseDto[] => {
  const { types, intensities } = filters;

  if (!types.length && !intensities.length) return activities ?? [];

  return (activities ?? []).filter((activity) => {
    if (types.length && (!activity.type || !types.includes(activity.type))) return false;
    if (intensities.length && (!activity.intensity || !intensities.includes(activity.intensity))) {
      return false;
    }
    return true;
  });
};
