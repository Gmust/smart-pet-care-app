import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import type { ActivityLogResponseDto } from "@/api/generated";
import { AddButton } from "@/common/components/AddButton";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { ActivityListEmpty } from "../components/ActivityListEmpty";
import { ActivityListSection } from "../components/ActivityListSection";
import { ActivityMap, type ActivityMapMarker } from "../components/ActivityMap";
import { ActivityPetSelector } from "../components/ActivityPetSelector";
import { ActivityActionsDrawer } from "../components/drawers/ActivityActionsDrawer";
import { ActivityDetailsDrawer } from "../components/drawers/ActivityDetailsDrawer";
import { ActivityFilterDrawer } from "../components/drawers/ActivityFilterDrawer";
import { CreateActivityDrawer } from "../components/drawers/CreateActivityDrawer";
import { PetPickerDrawer } from "../components/drawers/PetPickerDrawer";
import { DEFAULT_RANGE_DAYS } from "../constants";
import { useActivityLogDelete } from "../hooks/useActivityLogDelete";
import { useActivityLogsQuery } from "../queries/useActivityLogsQuery";
import { ActivityListSkeleton } from "../skeletons/ActivityListSkeleton";
import type { ActivityFilters } from "../types";
import { decodeActivityLocation } from "../utils/activityLocation";
import { filterActivities } from "../utils/filterActivities";
import { groupActivitiesByDay } from "../utils/groupActivitiesByDay";

const NO_FILTERS: ActivityFilters = { types: [], intensities: [] };

export default function ActivityTrackerPage() {
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>(undefined);
  const [isPetPickerOpen, setIsPetPickerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  // Tapping a card opens the actions sheet; "show full info" swaps it for details.
  const [actionsActivity, setActionsActivity] = useState<ActivityLogResponseDto | null>(null);
  const [detailsActivity, setDetailsActivity] = useState<ActivityLogResponseDto | null>(null);
  const [editActivity, setEditActivity] = useState<ActivityLogResponseDto | null>(null);
  // Held in state so "clear filters" can restore it and the empty state can
  // tell a default range apart from one the user chose.
  const [defaultFrom] = useState(() =>
    dayjs().subtract(DEFAULT_RANGE_DAYS, "day").startOf("day").toISOString()
  );
  const [from, setFrom] = useState<string | null>(defaultFrom);
  const [to, setTo] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>(NO_FILTERS);

  const { t } = useTranslation(["activity", "common"]);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // The tab bar is absolutely positioned over the screen: a 60px bar plus the
  // wrapper's bottom padding (the safe-area inset, or 16 where there is none).
  // SafeAreaView has already inset this screen by insets.bottom, so only the
  // remainder still overlaps. The scrolling list handles this with its own
  // content padding; the map is flex-sized and needs the margin instead.
  const tabBarOverlay =
    theme.spacing(15) + Math.max(insets.bottom, theme.spacing(4)) - insets.bottom;

  const { data: pets, isLoading: isPetsLoading, isError: isPetsError } = usePetsQuery();
  const {
    data: activities,
    isLoading,
    isFetching,
    isError: isActivitiesError,
    refetch,
  } = useActivityLogsQuery({
    petId: selectedPetId,
    from: from ?? undefined,
    to: to ?? undefined,
  });
  const { requestDelete, dialogProps } = useActivityLogDelete(selectedPetId);

  const selectedPet = pets?.find((pet) => pet.id === selectedPetId);
  const hasPets = !isPetsLoading && (pets?.length ?? 0) > 0;

  // Type and intensity are filtered here, not by the API — it only accepts
  // from/to/source. See design.md decision 5.
  const filteredActivities = useMemo(
    () => filterActivities(activities, filters),
    [activities, filters]
  );
  const rows = useMemo(() => groupActivitiesByDay(filteredActivities), [filteredActivities]);

  const markers = useMemo<ActivityMapMarker[]>(
    () =>
      filteredActivities.flatMap((activity) => {
        const location = decodeActivityLocation(activity.location);
        if (!location?.coordinates || !activity.id) return [];
        return [
          {
            id: activity.id,
            title: t("activity:map.markerLabel", {
              type: activity.type ? t(`activity:types.${activity.type}`) : "",
              time: activity.recordedAt ? dayjs(activity.recordedAt).format("MMM D, HH:mm") : "",
            }),
            coordinates: location.coordinates,
          },
        ];
      }),
    [filteredActivities, t]
  );

  // A non-default range is a filter too: without counting it, a range that
  // matches nothing reads as "nothing was ever recorded" and offers no way out.
  const hasDateFilter = from !== defaultFrom || to !== null;
  const activeFilterCount =
    filters.types.length + filters.intensities.length + (hasDateFilter ? 1 : 0);

  // Select the first pet when nothing is selected, and re-select when the
  // chosen pet is gone (deleted elsewhere) — otherwise every request keeps
  // targeting a pet that no longer exists and the selector disappears.
  useEffect(() => {
    if (isPetsLoading) return;
    if (selectedPetId && pets?.some((pet) => pet.id === selectedPetId)) return;
    setSelectedPetId(pets?.[0]?.id);
  }, [pets, isPetsLoading, selectedPetId]);

  const clearFilters = () => {
    setFilters(NO_FILTERS);
    setFrom(defaultFrom);
    setTo(null);
  };

  const isError = isPetsError || isActivitiesError;
  const emptyReason = isError
    ? "error"
    : !hasPets
      ? "noPets"
      : activeFilterCount > 0
        ? "noMatches"
        : "noActivity";

  return (
    <>
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          {selectedPet ? (
            <ActivityPetSelector
              selectedPet={selectedPet}
              canSwitch={(pets?.length ?? 0) > 1}
              onPress={() => setIsPetPickerOpen(true)}
            />
          ) : (
            <Text variant="titleL" style={styles.title}>
              {t("activity:screen.title")}
            </Text>
          )}

          {hasPets && (
            <AddButton
              accessibilityLabel={t("activity:screen.addActivity")}
              onPress={() => setIsCreateDrawerOpen(true)}
            />
          )}
        </View>

        {hasPets && (
          <View style={styles.toolbar}>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setIsFilterDrawerOpen(true)}
              accessibilityLabel={t("activity:screen.openFilters")}
            >
              {activeFilterCount > 0
                ? `${t("activity:screen.openFilters")} · ${activeFilterCount}`
                : t("activity:screen.openFilters")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => setIsMapView((current) => !current)}>
              {isMapView ? t("activity:screen.openList") : t("activity:screen.openMap")}
            </Button>
          </View>
        )}

        {isPetsLoading || (isLoading && hasPets) ? (
          <ActivityListSkeleton />
        ) : isMapView ? (
          markers.length ? (
            <ActivityMap style={[styles.map, { marginBottom: tabBarOverlay }]} markers={markers} />
          ) : (
            <Text variant="body" style={styles.mapEmpty}>
              {t("activity:map.empty")}
            </Text>
          )
        ) : (
          <ActivityListSection
            rows={rows}
            isRefreshing={isFetching && !isLoading}
            onRefresh={refetch}
            onSelectActivity={setActionsActivity}
            ListEmptyComponent={
              <ActivityListEmpty
                reason={emptyReason}
                onClearFilters={clearFilters}
                onGoToPets={() => router.push("/(tabs)/pets")}
                onRetry={refetch}
              />
            }
          />
        )}
      </SafeAreaView>

      {!!pets?.length && (
        <PetPickerDrawer
          isOpen={isPetPickerOpen}
          setIsOpen={setIsPetPickerOpen}
          pets={pets}
          selectedPetId={selectedPetId}
          // Filters deliberately survive a pet switch.
          onSelect={setSelectedPetId}
        />
      )}

      {!!selectedPetId && (
        <CreateActivityDrawer
          isOpen={isCreateDrawerOpen}
          setIsOpen={setIsCreateDrawerOpen}
          petId={selectedPetId}
        />
      )}

      <ActivityFilterDrawer
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
        from={from}
        to={to}
        filters={filters}
        onApply={(nextFrom, nextTo, nextFilters) => {
          setFrom(nextFrom);
          setTo(nextTo);
          setFilters(nextFilters);
        }}
      />

      <ActivityActionsDrawer
        activity={actionsActivity}
        onClose={() => setActionsActivity(null)}
        onShowDetails={(activity) => {
          setActionsActivity(null);
          setDetailsActivity(activity);
        }}
        onEdit={(activity) => {
          setActionsActivity(null);
          setEditActivity(activity);
        }}
        onDelete={(activity) => {
          setActionsActivity(null);
          if (!activity.id) {
            Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
            return;
          }
          requestDelete({
            id: activity.id,
            title: activity.type ? t(`activity:types.${activity.type}`) : "",
          });
        }}
      />

      <ActivityDetailsDrawer activity={detailsActivity} onClose={() => setDetailsActivity(null)} />

      {!!editActivity && !!selectedPetId && (
        // Keyed so the form re-seeds from whichever entry is being edited.
        <CreateActivityDrawer
          key={editActivity.id}
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditActivity(null);
          }}
          petId={selectedPetId}
          activity={editActivity}
        />
      )}

      <DeleteConfirmDialog {...dialogProps} />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  title: {
    color: theme.palette.brand.textBody,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  map: {
    flex: 1,
    marginHorizontal: theme.spacing(4),
  },
  mapEmpty: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
    paddingHorizontal: theme.spacing(6),
    paddingTop: theme.spacing(12),
  },
}));
