import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Card } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

export const AnalysisRunningCard = () => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <ActivityIndicator color={theme.palette.brand.primaryDefault} />
      <Text variant="bodyS" style={styles.message}>
        {t("feeding:analysis.running")}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    boxShadow: theme.shadows.card,
  },
  message: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
