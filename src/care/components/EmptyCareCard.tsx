import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type Props = {
  onPress?: () => void;
};

export function EmptyCareCard({ onPress }: Props) {
  const { t } = useTranslation(["care"]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("emptyState.notConfigured")}
      onPress={onPress}
      style={({ pressed }) => [styles.centeredCard, pressed && styles.cardPressed]}
    >
      <Text style={styles.centeredText}>{t("emptyState.notConfigured")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  centeredCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    paddingVertical: theme.spacing(6),
  },
  centeredText: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
