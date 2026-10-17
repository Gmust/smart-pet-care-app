import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { Redirect, useLocalSearchParams } from "expo-router";

import type { PetWeightLogResponseDto } from "@/api/generated";
import { AddButton } from "@/common/components/AddButton";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { QueryErrorState } from "@/common/components/QueryErrorState";
import { SectionHeader } from "@/common/components/SectionHeader";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { ListCard } from "@/shadecn/ui/card";
import { Tabs } from "@/shadecn/ui/tabs";

import { LogWeightDrawer } from "../components/drawers/LogWeightDrawer";
import { EmptyCard } from "../components/EmptyCard";
import { FeedingScreenHeader } from "../components/FeedingScreenHeader";
import { WeightEntryRow } from "../components/WeightEntryRow";
import { WeightHistoryChartCard } from "../components/WeightHistoryChartCard";
import type { WeightPeriod } from "../constants";
import { WEIGHT_PERIOD_KEYS, WEIGHT_PERIODS } from "../constants";
import { useFeedingRefresh } from "../hooks/useFeedingRefresh";
import { useWeightLogDelete } from "../hooks/useWeightLogDelete";
import { useWeightHistoryQuery } from "../queries/useWeightHistoryQuery";
import { feedingParamsSchema } from "../schemas/feeding-params.schema";
import { WeightHistorySkeleton } from "../skeletons/WeightHistorySkeleton";
import { toApiNumber } from "../utils/toApiNumber";
import { toWeightPoints } from "../utils/toWeightPoints";

export default function WeightHistoryPage() {
  const { t } = useTranslation(["feeding", "common"]);

  const [period, setPeriod] = useState<WeightPeriod>("quarter");
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PetWeightLogResponseDto | null>(null);
  const { isRefreshing, onRefresh } = useFeedingRefresh();

  const parsedParams = feedingParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;

  const { data: pet } = usePetQuery(petId);
  const {
    data: weightLogs,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useWeightHistoryQuery({
    petId,
    from: dayjs()
      .subtract(WEIGHT_PERIODS[period].amount, WEIGHT_PERIODS[period].unit)
      .startOf("day")
      .toISOString(),
    to: dayjs().endOf("day").toISOString(),
  });
  const { requestDelete, dialogProps } = useWeightLogDelete(petId);

  const points = useMemo(() => toWeightPoints(weightLogs), [weightLogs]);
  const entries = useMemo(
    () =>
      (weightLogs ?? [])
        .flatMap((entry) => {
          const weightKg = toApiNumber(entry.weightKg);
          return weightKg === null || !entry.measuredAt ? [] : [{ entry, weightKg }];
        })
        .sort(
          (left, right) =>
            dayjs(right.entry.measuredAt).valueOf() - dayjs(left.entry.measuredAt).valueOf()
        ),
    [weightLogs]
  );

  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  // Failed or offline with nothing cached must not read as "no entries yet".
  if (!weightLogs && (isError || fetchStatus === "paused")) {
    return <QueryErrorState onRetry={refetch} fallbackHref="/(tabs)/pets" />;
  }

  return (
    <View style={styles.screen}>
      <FeedingScreenHeader
        title={t("feeding:weight.title")}
        subtitle={pet?.name}
        action={
          <AddButton
            accessibilityLabel={t("feeding:weight.logAction")}
            onPress={() => setIsLogOpen(true)}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.filters}>
          <Tabs
            variant="chips"
            items={WEIGHT_PERIOD_KEYS.map((key) => ({
              key,
              label: t(`feeding:weight.periods.${key}`),
            }))}
            value={period}
            onChange={(key) => {
              const next = WEIGHT_PERIOD_KEYS.find((candidate) => candidate === key);
              if (next) setPeriod(next);
            }}
          />
        </View>

        {isPending && <WeightHistorySkeleton />}

        {!isPending && entries.length === 0 && (
          <EmptyCard
            message={t("feeding:empty.weight.message")}
            actionLabel={t("feeding:empty.weight.action")}
            onActionPress={() => setIsLogOpen(true)}
          />
        )}

        {points.length > 0 && <WeightHistoryChartCard points={points} period={period} />}

        {entries.length > 0 && (
          <View style={styles.block}>
            <SectionHeader
              label={t("feeding:weight.entries")}
              action={t("feeding:weight.logAction")}
              onActionPress={() => setIsLogOpen(true)}
            />
            <ListCard style={styles.list}>
              {entries.map(({ entry, weightKg }) => (
                <WeightEntryRow
                  key={entry.id ?? entry.measuredAt}
                  entry={entry}
                  weightKg={weightKg}
                  onEdit={setEditingEntry}
                  onDelete={(target) => {
                    if (target.id) requestDelete(target.id);
                  }}
                />
              ))}
            </ListCard>
          </View>
        )}
      </ScrollView>

      <DeleteConfirmDialog {...dialogProps} />
      {!!petId && (
        <>
          <LogWeightDrawer isOpen={isLogOpen} setIsOpen={setIsLogOpen} petId={petId} />
          {!!editingEntry && (
            <LogWeightDrawer
              key={editingEntry.id}
              isOpen
              setIsOpen={(open) => {
                if (!open) setEditingEntry(null);
              }}
              petId={petId}
              log={editingEntry}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
  },
  filters: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  block: {
    gap: theme.spacing(2),
  },
  list: {
    boxShadow: theme.shadows.card,
  },
}));
