import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

type Props = {
  /** Which empty state to show — they carry different copy and actions. */
  reason: "noPets" | "noActivity" | "noMatches" | "error";
  onClearFilters: () => void;
  onGoToPets: () => void;
  onRetry: () => void;
};

export const ActivityListEmpty = ({ reason, onClearFilters, onGoToPets, onRetry }: Props) => {
  const { t } = useTranslation(["activity"]);

  const message =
    reason === "error"
      ? t("activity:list.error")
      : reason === "noPets"
        ? t("activity:list.noPets")
        : reason === "noMatches"
          ? t("activity:list.emptyFiltered")
          : t("activity:list.empty");

  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.message}>
        {message}
      </Text>

      {reason === "error" && (
        <Button variant="secondary" size="md" onPress={onRetry}>
          {t("activity:list.retry")}
        </Button>
      )}

      {reason === "noMatches" && (
        <Button variant="secondary" size="md" onPress={onClearFilters}>
          {t("activity:list.clearFilters")}
        </Button>
      )}

      {reason === "noPets" && (
        <Button variant="secondary" size="md" onPress={onGoToPets}>
          {t("activity:list.goToPets")}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(6),
    paddingTop: theme.spacing(12),
  },
  message: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
