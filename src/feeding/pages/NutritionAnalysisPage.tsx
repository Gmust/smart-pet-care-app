import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { Redirect, useLocalSearchParams } from "expo-router";

import { QueryErrorState } from "@/common/components/QueryErrorState";
import { SectionHeader } from "@/common/components/SectionHeader";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { AnalysisDetailCard } from "../components/AnalysisDetailCard";
import { AnalysisErrorCard } from "../components/AnalysisErrorCard";
import { AnalysisRunningCard } from "../components/AnalysisRunningCard";
import { LogMealDrawer } from "../components/drawers/LogMealDrawer";
import { EmptyCard } from "../components/EmptyCard";
import { FeedingScreenHeader } from "../components/FeedingScreenHeader";
import { PreviousAnalysisCard } from "../components/PreviousAnalysisCard";
import { useFeedingRefresh } from "../hooks/useFeedingRefresh";
import { useNutritionAnalysis } from "../hooks/useNutritionAnalysis";
import { feedingParamsSchema } from "../schemas/feeding-params.schema";
import { AnalysisCardSkeleton } from "../skeletons/AnalysisCardSkeleton";

export default function NutritionAnalysisPage() {
  const { t } = useTranslation(["feeding", "common"]);

  const parsedParams = feedingParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;

  const [isLogMealOpen, setIsLogMealOpen] = useState(false);
  const { isRefreshing, onRefresh } = useFeedingRefresh();

  const { data: pet } = usePetQuery(petId);
  const {
    latest,
    previous,
    isEstimate,
    canRun,
    blocker,
    isRunning,
    run,
    runFailure,
    isPending,
    isFailed,
    refetch,
  } = useNutritionAnalysis(petId);

  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  if (isFailed) {
    return <QueryErrorState onRetry={refetch} fallbackHref="/(tabs)/pets" />;
  }

  return (
    <View style={styles.screen}>
      <FeedingScreenHeader title={t("feeding:analysis.title")} subtitle={pet?.name} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.block}>
          <SectionHeader label={t("feeding:analysis.latest")} />
          {!!runFailure && (
            <AnalysisErrorCard
              message={runFailure.message}
              retryAfterSeconds={runFailure.retryAfterSeconds}
              retryable={runFailure.retryable}
              isRunning={isRunning}
              onRetry={run}
            />
          )}
          {!runFailure && !!latest && (
            <AnalysisDetailCard analysis={latest} isEstimate={isEstimate} />
          )}
          {!runFailure && !latest && isPending && <AnalysisCardSkeleton />}
          {!runFailure && !latest && isRunning && <AnalysisRunningCard />}
          {!runFailure && !latest && !isPending && !isRunning && !blocker && (
            <EmptyCard
              message={t("feeding:empty.analysis.message")}
              actionLabel={t("feeding:empty.analysis.action")}
              onActionPress={run}
            />
          )}
          {!runFailure && !latest && !isPending && !isRunning && blocker === "noCalories" && (
            <EmptyCard message={t("feeding:empty.analysis.noCalories")} />
          )}
          {!runFailure && !latest && !isPending && !isRunning && blocker === "noMeals" && (
            <EmptyCard
              message={t("feeding:empty.analysis.noMeals")}
              actionLabel={t("feeding:empty.meals.action")}
              onActionPress={() => setIsLogMealOpen(true)}
            />
          )}
        </View>

        {!!previous && (
          <View style={styles.block}>
            <SectionHeader label={t("feeding:analysis.previous")} />
            <PreviousAnalysisCard analysis={previous} isEstimate={isEstimate} />
            <Text variant="caption" style={styles.historyNote}>
              {t("feeding:analysis.historyLimit")}
            </Text>
          </View>
        )}

        {!!latest && (
          <View style={styles.block}>
            <Button
              variant="primary"
              size="md"
              disabled={!canRun}
              isLoading={isRunning}
              onPress={run}
            >
              {t("feeding:analysis.run")}
            </Button>
            {!canRun && (
              <Text variant="caption" style={styles.caption}>
                {blocker === "noCalories"
                  ? t("feeding:analysis.addCaloriesToRun")
                  : t("feeding:analysis.upToDate", { when: dayjs(latest.createdAt).fromNow() })}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {!!petId && (
        <LogMealDrawer isOpen={isLogMealOpen} setIsOpen={setIsLogMealOpen} petId={petId} />
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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  block: {
    gap: theme.spacing(2),
  },
  historyNote: {
    color: theme.palette.brand.textFaint,
  },
  caption: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
