import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { TimelineEvent } from "../types";
import { SectionLabel } from "./SectionLabel";
import { TimelineRow } from "./TimelineRow";

type TimelineSectionProps = {
  events: TimelineEvent[];
  onStatusChange: (message: string) => void;
};

export function TimelineSection({ events, onStatusChange }: TimelineSectionProps) {
  const { t } = useTranslation(["home"]);

  const handleOpenTimeline = useCallback(() => {
    onStatusChange(t("mockStatus.timelineOpened"));
  }, [onStatusChange, t]);

  return (
    <>
      <SectionLabel
        title={t("sectionLabel.recentEvents.title")}
        action={t("sectionLabel.recentEvents.action")}
        onActionPress={handleOpenTimeline}
      />
      <View style={styles.timelineCard}>
        {events.map((event, index) => (
          <TimelineRow key={event.id} event={event} last={index === events.length - 1} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  timelineCard: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    overflow: "hidden",
  },
}));
