import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { quickActions } from "../data";
import type { TimelineEvent } from "../types";
import { QuickAction } from "./QuickAction";
import { SectionLabel } from "./SectionLabel";

type QuickActionsSectionProps = {
  onAddEvent: (event: TimelineEvent) => void;
  onStatusChange: (message: string) => void;
};

export function QuickActionsSection({ onAddEvent, onStatusChange }: QuickActionsSectionProps) {
  const { t } = useTranslation(["home"]);

  const handleQuickActionPress = useCallback(
    (itemId: string) => {
      const action = quickActions.find((quickAction) => quickAction.id === itemId);

      if (!action) {
        return;
      }

      onStatusChange(t("mockStatus.quickAction", { label: action.label }));
      onAddEvent({
        id: `quick-${itemId}-${Date.now()}`,
        icon: action.icon,
        title: t("mockEvents.quickAction.title", { label: action.label }),
        meta: t("mockEvents.justNow"),
        dot: "ok",
      });
    },
    [onAddEvent, onStatusChange, t]
  );

  return (
    <>
      <SectionLabel title={t("sectionLabel.quickActions.title")} />
      <View style={styles.grid}>
        {quickActions.map((item) => (
          <QuickAction key={item.id} item={item} onPress={() => handleQuickActionPress(item.id)} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
}));
