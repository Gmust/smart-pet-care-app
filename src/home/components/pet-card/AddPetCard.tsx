import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { PlusIcon } from "@/icons/plus";
import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type AddPetCardProps = {
  onPress?: () => void;
};

export function AddPetCard({ onPress }: AddPetCardProps) {
  const { t } = useTranslation(["home"]);
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("addPet.title")}
      onPress={onPress}
      unstable_pressDelay={PRESS_HIGHLIGHT_DELAY_MS}
      style={({ pressed }) => [styles.card, pressed && cardVariants.pressed]}
    >
      <View style={styles.icon}>
        <PlusIcon
          width={theme.iconSize["2xl"]}
          height={theme.iconSize["2xl"]}
          color={palette.brand.primaryDefault}
        />
      </View>
      <Text variant="titleM" style={styles.title}>
        {t("addPet.title")}
      </Text>
      <Text variant="bodyS" style={styles.subtitle}>
        {t("addPet.subtitle")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius["2xl"],
    borderWidth: theme.spacing(0.375),
    borderStyle: "dashed",
    borderColor: theme.palette.brand.surfaceBorder,
  },
  icon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primarySoft,
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
}));
