import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { isAxiosError } from "axios";
import { Redirect, useLocalSearchParams } from "expo-router";

import type { WellnessReminderSuggestionDto } from "@/api/generated";
import { ClassifierWellnessBand } from "@/api/generated";
import { BackButton } from "@/common/components/BackButton";
import { SectionHeader } from "@/common/components/SectionHeader";
import { CircleAlertIcon } from "@/icons/alert";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { CreateReminderDrawer } from "@/reminders/components/CreateReminderDrawer";
import { Button } from "@/shadecn/ui/button";
import { Card, ListCard } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { WellnessStateRow } from "../components/WellnessStateRow";
import { isWellnessStateOk, WELLNESS_STATE_KEYS } from "../constants";
import { useWellnessQuery } from "../queries/useWellnessQuery";
import { wellnessParamsSchema } from "../schemas/wellness-params.schema";
import { WellnessPageSkeleton } from "../skeletons/WellnessPageSkeleton";
import { getWellnessErrorMessage } from "../utils/getWellnessErrorMessage";
import { parseWellnessScore } from "../utils/parseWellnessScore";

const BAND_STYLE_KEY = {
  [ClassifierWellnessBand.EXCELLENT]: "scoreOk",
  [ClassifierWellnessBand.GOOD]: "scoreOk",
  [ClassifierWellnessBand.FAIR]: "scoreWarn",
  [ClassifierWellnessBand.CONCERNING]: "scoreWarn",
  [ClassifierWellnessBand.CRITICAL]: "scoreDanger",
} as const satisfies Record<ClassifierWellnessBand, "scoreOk" | "scoreWarn" | "scoreDanger">;

export default function WellnessPage() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["wellness", "reminders"]);

  const parsedParams = wellnessParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;

  const { data: pet, error: petError } = usePetQuery(petId);
  const {
    data: wellness,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useWellnessQuery(petId);

  const [selectedSuggestion, setSelectedSuggestion] =
    useState<WellnessReminderSuggestionDto | null>(null);
  const { theme } = useUnistyles();

  // Stable identity: the drawer re-seeds its form whenever this object
  // changes, so an inline literal would wipe the user's edits every render.
  const suggestedReminder = useMemo(
    () =>
      selectedSuggestion && petId
        ? {
            petId,
            type: selectedSuggestion.type,
            title: t(`reminders:types.${selectedSuggestion.type}`),
            description: selectedSuggestion.text,
          }
        : null,
    [selectedSuggestion, petId, t]
  );

  const score = parseWellnessScore(wellness?.wellnessScore);

  // Deep links can carry arbitrary params — never query with an unvalidated petId.
  // A deleted pet or stale link: the evaluation 404s into the empty state, so
  // the pet itself is what tells "gone" apart from "no score yet".
  if (!parsedParams.success || (isAxiosError(petError) && petError.response?.status === 404)) {
    return <Redirect href="/(tabs)/pets" />;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <View style={styles.topBarTexts}>
          <Text variant="titleL" style={styles.topBarTitle}>
            {t("wellness:title")}
          </Text>
          {!!pet?.name && (
            <Text variant="bodyS" style={styles.topBarSubtitle}>
              {pet.name}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            // The server hands back the stored score until 3 days have passed,
            // so a pull is a plain refetch — no recalculation to trigger.
            onRefresh={async () => {
              const result = await refetch();
              if (result.isError) {
                Toast.show({
                  type: "error",
                  text1: t("wellness:error.title"),
                  text2: getWellnessErrorMessage(result.error, t),
                });
              }
            }}
            tintColor={theme.palette.brand.primaryDefault}
            colors={[theme.palette.brand.primaryDefault]}
          />
        }
      >
        {isLoading ? (
          <WellnessPageSkeleton />
        ) : isError && !wellness ? (
          <Card>
            <Text variant="titleM">{t("wellness:error.title")}</Text>
            <Text variant="bodyS" style={styles.muted}>
              {getWellnessErrorMessage(error, t)}
            </Text>
          </Card>
        ) : !wellness ? (
          <Card>
            <Text variant="titleM">{t("wellness:empty.title")}</Text>
            <Text variant="bodyS" style={styles.muted}>
              {t("wellness:empty.description", { petName: pet?.name ?? "" })}
            </Text>
          </Card>
        ) : (
          <>
            <Card radius="loose">
              <View style={styles.scoreRow}>
                <Text
                  variant="display"
                  style={wellness.band ? styles[BAND_STYLE_KEY[wellness.band]] : styles.scoreMuted}
                >
                  {score ?? t("wellness:score.unavailable")}
                </Text>
                {score !== null && (
                  <Text variant="titleM" style={styles.scoreMax}>
                    {t("wellness:score.outOf")}
                  </Text>
                )}
              </View>
              <Text variant="bodySemiBold">
                {wellness.band ? t(`wellness:band.${wellness.band}`) : t("wellness:band.unknown")}
              </Text>
              <Text variant="bodyS" style={styles.muted}>
                {t(`wellness:status.${wellness.scoreStatus}`)}
              </Text>
              <View style={styles.updateNote}>
                <CircleAlertIcon width={14} height={14} color={theme.palette.brand.textSecondary} />
                <Text variant="caption" style={styles.updateNoteText}>
                  {t("wellness:updateNote")}
                </Text>
              </View>
            </Card>

            {!!wellness.narrative && (
              <View style={styles.section}>
                <SectionHeader label={t("wellness:sections.summary")} />
                <Card>
                  <Text variant="body" style={styles.body}>
                    {wellness.narrative}
                  </Text>
                </Card>
              </View>
            )}

            <View style={styles.section}>
              <SectionHeader label={t("wellness:states.title")} />
              <ListCard>
                {WELLNESS_STATE_KEYS.map((key) => (
                  <WellnessStateRow
                    key={key}
                    label={t(`wellness:states.labels.${key}`)}
                    value={t(`wellness:states.codes.${wellness.states[key]}`)}
                    isOk={isWellnessStateOk(wellness.states[key])}
                  />
                ))}
              </ListCard>
            </View>

            {wellness.recommendations.length > 0 && (
              <View style={styles.section}>
                <SectionHeader label={t("wellness:sections.recommendations")} />
                <Card>
                  <View style={styles.list}>
                    {wellness.recommendations.map((recommendation) => (
                      <View key={recommendation} style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text variant="body" style={styles.body}>
                          {recommendation}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            )}

            {wellness.reminderSuggestions.length > 0 && (
              <View style={styles.section}>
                <SectionHeader label={t("wellness:sections.reminderSuggestions")} />
                <Card>
                  <View style={styles.list}>
                    {wellness.reminderSuggestions.map((suggestion) => (
                      <View key={`${suggestion.type}-${suggestion.text}`} style={styles.suggestion}>
                        <Chip
                          label={t(`reminders:types.${suggestion.type}`)}
                          tone="primary"
                          size="sm"
                        />
                        <Text variant="body" style={styles.body}>
                          {suggestion.text}
                        </Text>
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => setSelectedSuggestion(suggestion)}
                        >
                          {t("wellness:suggestions.addReminder")}
                        </Button>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            )}

            {!!wellness.disclaimer && (
              <Text variant="caption" style={styles.disclaimer}>
                {wellness.disclaimer}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {!!suggestedReminder && (
        <CreateReminderDrawer
          isOpen
          setIsOpen={(open) => {
            if (!open) setSelectedSuggestion(null);
          }}
          initialValues={suggestedReminder}
        />
      )}
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
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(5),
    paddingBottom: theme.spacing(3),
  },
  topBarTexts: {
    flex: 1,
  },
  topBarTitle: {
    color: theme.palette.brand.textPrimary,
  },
  topBarSubtitle: {
    color: theme.palette.brand.textSecondary,
  },
  content: {
    gap: theme.spacing(5),
    paddingHorizontal: theme.spacing(5),
    paddingBottom: theme.spacing(28),
  },
  section: {
    gap: theme.spacing(2),
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing(1),
  },
  scoreOk: {
    color: theme.palette.brand.ok,
  },
  scoreWarn: {
    color: theme.palette.brand.warn,
  },
  scoreDanger: {
    color: theme.palette.brand.danger,
  },
  scoreMuted: {
    color: theme.palette.brand.textSecondary,
  },
  scoreMax: {
    marginBottom: theme.spacing(1),
    color: theme.palette.brand.textSecondary,
  },
  body: {
    flex: 1,
    color: theme.palette.brand.textBody,
  },
  muted: {
    color: theme.palette.brand.textSecondary,
  },
  list: {
    gap: theme.spacing(2.5),
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(2.5),
  },
  bullet: {
    marginTop: theme.spacing(1.75),
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  suggestion: {
    gap: theme.spacing(1.5),
  },
  updateNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  updateNoteText: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
  disclaimer: {
    color: theme.palette.brand.textFaint,
  },
}));
