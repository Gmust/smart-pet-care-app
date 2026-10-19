import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

import { BackButton } from "@/common/components/BackButton";
import { QueryErrorState } from "@/common/components/QueryErrorState";
import { FeedingTabContent } from "@/feeding/components/FeedingTabContent";
import { useFeedingRefresh } from "@/feeding/hooks/useFeedingRefresh";
import { Tabs, tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { WellnessTabContent } from "@/wellness/components/WellnessTabContent";
import { useWellnessRefresh } from "@/wellness/hooks/useWellnessRefresh";

import { AssessmentHero } from "../components/assessment/AssessmentHero";
import { EmptyTabPlaceholder } from "../components/tabs/EmptyTabPlaceholder";
import { useBackToOrigin } from "../hooks/useBackToOrigin";
import { usePetQuery } from "../queries/usePetQuery";
import {
  ASSESSMENT_TAB_KEYS,
  assessmentParamsSchema,
  type AssessmentTabKey,
} from "../schemas/assessment-params.schema";

export default function AssessmentPage() {
  const parsedParams = assessmentParamsSchema.safeParse(useLocalSearchParams());

  const [activeTab, setActiveTab] = useState<AssessmentTabKey>(
    (parsedParams.success && parsedParams.data.tab) || "wellness"
  );

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["feeding", "pets", "common"]);

  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const goBackToOrigin = useBackToOrigin(parsedParams.success ? parsedParams.data.from : undefined);
  const feedingRefresh = useFeedingRefresh();
  const wellnessRefresh = useWellnessRefresh(petId);
  const { data: pet, isError: isPetError, refetch: refetchPet } = usePetQuery(petId);

  const tabParam = parsedParams.success ? parsedParams.data.tab : undefined;
  const refresh =
    activeTab === "wellness" ? wellnessRefresh : activeTab === "feeding" ? feedingRefresh : null;

  const goToTabBy = (offset: number) => {
    const nextTab = ASSESSMENT_TAB_KEYS[ASSESSMENT_TAB_KEYS.indexOf(activeTab) + offset];
    if (nextTab) setActiveTab(nextTab);
  };

  const swipeTabs = Gesture.Race(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => goToTabBy(1)),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .runOnJS(true)
      .onEnd(() => goToTabBy(-1))
  );

  // Re-opening a mounted screen with another tab changes its params, not its state.
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  // A valid-looking id that belongs to someone else answers 404. Without this
  // the screen renders its chrome over an empty body and looks merely slow.
  if (isPetError) {
    return <QueryErrorState onRetry={refetchPet} fallbackHref="/(tabs)/pets" />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <BackButton onBackPress={goBackToOrigin} />
        <Animated.View
          key={activeTab === "wellness" ? "assessment" : "pet"}
          entering={FadeIn.duration(200)}
          style={styles.titleBox}
        >
          <Text variant="titleL" style={styles.title} numberOfLines={1}>
            {activeTab === "wellness" ? t("pets:petListCard.assessment") : (pet?.name ?? "")}
          </Text>
        </Animated.View>
        <View style={styles.topBarSpacer} />
      </View>

      {activeTab === "wellness" && !!pet && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <AssessmentHero pet={pet} />
        </Animated.View>
      )}

      <Animated.View layout={LinearTransition.duration(200)}>
        <Tabs
          items={ASSESSMENT_TAB_KEYS.map((key) => ({
            key,
            label: t(`feeding:tabs.${key}`),
          }))}
          value={activeTab}
          onChange={setActiveTab}
          tone="peach"
        />
      </Animated.View>

      <GestureDetector gesture={swipeTabs}>
        <Animated.ScrollView
          key={activeTab}
          entering={tabsContentEntering}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          {...(refresh
            ? {
                refreshControl: (
                  <RefreshControl refreshing={refresh.isRefreshing} onRefresh={refresh.onRefresh} />
                ),
              }
            : {})}
        >
          {activeTab === "wellness" && !!petId && <WellnessTabContent petId={petId} />}

          {activeTab === "feeding" && !!petId && (
            <FeedingTabContent
              petId={petId}
              onSeeAllMeals={() =>
                router.push({ pathname: "/(tabs)/pets/feeding-log", params: { petId } })
              }
              onOpenAnalysis={() =>
                router.push({ pathname: "/(tabs)/pets/nutrition-analysis", params: { petId } })
              }
              onOpenSchedule={() =>
                router.push({
                  pathname: "/(tabs)/pets/pet-profile",
                  params: { petId, tab: "reminders" },
                })
              }
              onOpenWeightHistory={() =>
                router.push({ pathname: "/(tabs)/pets/weight-history", params: { petId } })
              }
            />
          )}

          {activeTab === "recommendations" && (
            <EmptyTabPlaceholder label={t("feeding:tabs.recommendationsHint")} />
          )}
        </Animated.ScrollView>
      </GestureDetector>
    </View>
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
    paddingVertical: theme.spacing(2),
  },
  titleBox: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  topBarSpacer: {
    width: theme.spacing(9),
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
}));
