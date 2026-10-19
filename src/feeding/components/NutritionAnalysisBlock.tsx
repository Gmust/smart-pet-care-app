import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { SectionHeader } from "@/common/components/SectionHeader";
import { Text } from "@/shadecn/ui/text";

import { useNutritionAnalysis } from "../hooks/useNutritionAnalysis";
import { AnalysisCardSkeleton } from "../skeletons/AnalysisCardSkeleton";

import { AnalysisCard } from "./AnalysisCard";
import { AnalysisErrorCard } from "./AnalysisErrorCard";
import { AnalysisRunningCard } from "./AnalysisRunningCard";
import { EmptyCard } from "./EmptyCard";

type NutritionAnalysisBlockProps = {
  petId: string;
  onOpenAnalysis: () => void;
  onLogMeal: () => void;
};

export const NutritionAnalysisBlock = ({
  petId,
  onOpenAnalysis,
  onLogMeal,
}: NutritionAnalysisBlockProps) => {
  const { t } = useTranslation(["feeding", "common"]);

  const {
    latest,
    isLatestGoal,
    canRun,
    blocker,
    isRunning,
    run,
    runFailure,
    dismissFailure,
    isPending,
    isFailed,
    refetch,
  } = useNutritionAnalysis(petId);

  const isLoading = isPending && !isFailed;
  const isEmpty = !latest && !isFailed && !isPending && !runFailure && !isRunning;

  return (
    <View style={styles.block}>
      <SectionHeader label={t("feeding:analysis.label")} />
      {!!runFailure && (
        <AnalysisErrorCard
          message={runFailure.message}
          retryAfterSeconds={runFailure.retryAfterSeconds}
          retryable={runFailure.retryable}
          isRunning={isRunning}
          onRetry={run}
          onDismiss={dismissFailure}
        />
      )}
      {isLoading && <AnalysisCardSkeleton />}
      {isRunning && !latest && <AnalysisRunningCard />}
      {!!latest && (
        <AnalysisCard
          analysis={latest}
          isGoal={isLatestGoal}
          canRun={canRun}
          isRunning={isRunning}
          onPress={onOpenAnalysis}
          onRun={run}
        />
      )}
      {!!latest && !canRun && (
        <Text variant="caption" style={styles.caption}>
          {blocker === "noCalories"
            ? t("feeding:analysis.addCaloriesToRun")
            : t("feeding:analysis.upToDate", { when: dayjs(latest.createdAt).fromNow() })}
        </Text>
      )}
      {isFailed && (
        <EmptyCard
          message={t("feeding:error.analysis")}
          actionLabel={t("common:errors.tryAgain")}
          onActionPress={() => refetch()}
        />
      )}
      {isEmpty && !blocker && (
        <EmptyCard
          message={t("feeding:empty.analysis.message")}
          actionLabel={t("feeding:empty.analysis.action")}
          onActionPress={run}
        />
      )}
      {isEmpty && blocker === "noCalories" && (
        <EmptyCard message={t("feeding:empty.analysis.noCalories")} />
      )}
      {isEmpty && blocker === "noMeals" && (
        <EmptyCard
          message={t("feeding:empty.analysis.noMeals")}
          actionLabel={t("feeding:empty.meals.action")}
          onActionPress={onLogMeal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.spacing(2),
  },
  caption: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
