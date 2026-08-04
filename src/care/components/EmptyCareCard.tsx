import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

type Props = {
  onPress?: () => void;
};

export const EmptyCareCard = ({ onPress }: Props) => {
  const { t } = useTranslation(["care"]);
  cardVariants.useVariants({ padding: "none", radius: "standalone" });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("emptyState.notConfigured")}
      onPress={onPress}
      style={({ pressed }) => [
        cardVariants.card,
        styles.centeredCard,
        pressed && styles.cardPressed,
      ]}
    >
      <Text variant="bodyS" style={styles.centeredText}>
        {t("emptyState.notConfigured")}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  centeredCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing(6),
  },
  centeredText: {
    color: theme.palette.brand.textSecondary,
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
