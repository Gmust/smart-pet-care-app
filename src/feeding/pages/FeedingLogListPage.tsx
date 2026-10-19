import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Redirect, useLocalSearchParams } from "expo-router";

import type { FoodType } from "@/api/generated";
import { AddButton } from "@/common/components/AddButton";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { QueryErrorState } from "@/common/components/QueryErrorState";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { Tabs } from "@/shadecn/ui/tabs";

import { EmptyCard } from "../components/EmptyCard";
import { FeedingDayBlock } from "../components/FeedingDayBlock";
import { FeedingScreenHeader } from "../components/FeedingScreenHeader";
import { MealDrawers } from "../components/MealDrawers";
import { FOOD_TYPES } from "../constants";
import { useFeedingLogDelete } from "../hooks/useFeedingLogDelete";
import { useFeedingOccurrences } from "../hooks/useFeedingOccurrences";
import { useFeedingRefresh } from "../hooks/useFeedingRefresh";
import { useMealDrawers } from "../hooks/useMealDrawers";
import { useFeedingLogsQuery } from "../queries/useFeedingLogsQuery";
import { feedingParamsSchema } from "../schemas/feeding-params.schema";
import { MealsListSkeleton } from "../skeletons/MealsListSkeleton";
import { buildFeedingRows } from "../utils/buildFeedingRows";
import { groupFeedingRowsByDay } from "../utils/groupFeedingRowsByDay";

type LogFilter = "all" | FoodType;

const LOG_FILTERS: LogFilter[] = ["all", ...FOOD_TYPES];

export default function FeedingLogListPage() {
  const { t } = useTranslation(["feeding", "common"]);

  const [filter, setFilter] = useState<LogFilter>("all");
  const mealDrawers = useMealDrawers();

  const parsedParams = feedingParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;

  const { data: pet } = usePetQuery(petId);
  const { data: logs, isPending, isError, fetchStatus, refetch } = useFeedingLogsQuery(petId);
  const { data: occurrences } = useFeedingOccurrences(petId);
  const { requestDelete, dialogProps } = useFeedingLogDelete(petId);
  const { isRefreshing, onRefresh } = useFeedingRefresh();

  const sections = useMemo(() => {
    const rows = buildFeedingRows(logs, occurrences);

    return groupFeedingRowsByDay(
      filter === "all"
        ? rows
        : rows.filter((row) => row.kind === "log" && row.log.foodType === filter)
    );
  }, [logs, occurrences, filter]);

  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  // Failed or offline with nothing cached must not read as "no meals yet".
  if (!logs && (isError || fetchStatus === "paused")) {
    return <QueryErrorState onRetry={refetch} fallbackHref="/(tabs)/pets" />;
  }

  const hasLogs = (logs?.length ?? 0) > 0;

  return (
    <View style={styles.screen}>
      <FeedingScreenHeader
        title={t("feeding:logList.title")}
        subtitle={pet?.name}
        action={
          <AddButton
            accessibilityLabel={t("feeding:forms.meal.createTitle")}
            onPress={mealDrawers.openCreate}
          />
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filters}
      >
        <Tabs
          variant="chips"
          items={LOG_FILTERS.map((key) => ({
            key,
            label: key === "all" ? t("feeding:logList.filters.all") : t(`feeding:foodTypes.${key}`),
          }))}
          value={filter}
          onChange={setFilter}
        />
      </ScrollView>

      {isPending ? (
        <View style={styles.content}>
          <MealsListSkeleton />
          <MealsListSkeleton />
        </View>
      ) : (
        <FlatList
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          data={sections}
          keyExtractor={(section) => section.key}
          renderItem={({ item }) => (
            <FeedingDayBlock
              section={item}
              onEdit={mealDrawers.editLog}
              onLogSlot={mealDrawers.logSlot}
              onDelete={(log) => {
                if (!log.id) return;
                requestDelete({ id: log.id, title: log.foodName ?? t("feeding:meals.untitled") });
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            hasLogs ? (
              <EmptyCard
                message={t("feeding:logList.emptyFiltered")}
                actionLabel={t("feeding:logList.showAll")}
                onActionPress={() => setFilter("all")}
              />
            ) : (
              <EmptyCard
                message={t("feeding:empty.meals.message")}
                actionLabel={t("feeding:empty.meals.action")}
                onActionPress={mealDrawers.openCreate}
              />
            )
          }
        />
      )}

      <DeleteConfirmDialog {...dialogProps} />
      <MealDrawers petId={petId} {...mealDrawers.drawerProps} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  // A horizontal ScrollView shrinks by default, and the list below (with its
  // refresh control) claims the height, which clips the chips.
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
  },
  content: {
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
  },
}));
