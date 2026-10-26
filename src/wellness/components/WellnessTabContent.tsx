import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { WellnessReminderSuggestionDto } from "@/api/generated";
import { ClassifierWellnessBand } from "@/api/generated";
import { SectionHeader } from "@/common/components/SectionHeader";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { CircleAlertIcon } from "@/icons/alert";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { CreateReminderDrawer } from "@/reminders/components/CreateReminderDrawer";
import { Button } from "@/shadecn/ui/button";
import { Card, ListCard } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { isWellnessStateOk, WELLNESS_STATE_KEYS } from "../constants";
import { useWellnessQuery } from "../queries/useWellnessQuery";
import { WellnessPageSkeleton } from "../skeletons/WellnessPageSkeleton";
import { parseWellnessScore } from "../utils/parseWellnessScore";

import { WellnessStateRow } from "./WellnessStateRow";

const BAND_STYLE_KEY = {
  [ClassifierWellnessBand.EXCELLENT]: "scoreOk",
  [ClassifierWellnessBand.GOOD]: "scoreOk",
  [ClassifierWellnessBand.FAIR]: "scoreWarn",
  [ClassifierWellnessBand.CONCERNING]: "scoreWarn",
  [ClassifierWellnessBand.CRITICAL]: "scoreDanger",
} as const satisfies Record<ClassifierWellnessBand, "scoreOk" | "scoreWarn" | "scoreDanger">;

type WellnessTabContentProps = {
  petId: string;
};

export const WellnessTabContent = ({ petId }: WellnessTabContentProps) => {
  const { t } = useTranslation(["wellness", "reminders", "common"]);
  const { theme } = useUnistyles();

  const [selectedSuggestion, setSelectedSuggestion] =
    useState<WellnessReminderSuggestionDto | null>(null);

  const { data: pet } = usePetQuery(petId);
  const { data: wellness, isLoading, isError, error, refetch } = useWellnessQuery(petId);

  // Stable identity: the drawer re-seeds its form whenever this object
  // changes, so an inline literal would wipe the user's edits every render.
  const suggestedReminder = useMemo(
    () =>
      selectedSuggestion
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

  return (
    <View style={styles.root}>
      {isLoading ? (
        <WellnessPageSkeleton />
      ) : isError && !wellness ? (
        <Card>
          <Text variant="titleM">{t("wellness:error.title")}</Text>
          <Text variant="bodyS" style={styles.muted}>
            {getApiErrorMessage(error)}
          </Text>
          {/* The query does not retry on mount, so without this only a hidden
              pull-to-refresh could recover from one transient failure. */}
          <Button size="sm" variant="tonal" onPress={() => void refetch()}>
            {t("common:errors.tryAgain")}
          </Button>
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
              <CircleAlertIcon
                width={theme.iconSize.md}
                height={theme.iconSize.md}
                color={theme.palette.brand.textSecondary}
              />
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
                        variant="tonal"
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
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing(4),
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
