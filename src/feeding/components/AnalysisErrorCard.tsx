import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

type AnalysisErrorCardProps = {
  message: string;
  retryAfterSeconds: number | null;
  retryable: boolean;
  isRunning: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

export const AnalysisErrorCard = ({
  message,
  retryAfterSeconds,
  retryable,
  isRunning,
  onRetry,
  onDismiss,
}: AnalysisErrorCardProps) => {
  const { t } = useTranslation(["feeding", "common"]);

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <Chip size="sm" variant="ghost" tone="danger" label={t("feeding:analysis.failed")} />
      <Text variant="bodyS" style={styles.message}>
        {message}
      </Text>
      {retryable && (
        <Text variant="bodyS" style={styles.hint}>
          {retryAfterSeconds
            ? t("feeding:analysis.retryIn", { count: retryAfterSeconds })
            : t("feeding:analysis.retryNow")}
        </Text>
      )}
      <View style={styles.action}>
        {retryable ? (
          <Button variant="text" size="inline" isLoading={isRunning} onPress={onRetry}>
            {t("common:errors.tryAgain")}
          </Button>
        ) : (
          <Button variant="text" size="inline" onPress={onDismiss}>
            {t("feeding:analysis.dismiss")}
          </Button>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow: theme.shadows.card,
  },
  message: {
    color: theme.palette.brand.textPrimary,
  },
  hint: {
    color: theme.palette.brand.textSecondary,
  },
  action: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));
