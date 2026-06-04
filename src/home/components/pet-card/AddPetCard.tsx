import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { PlusIcon } from "@/icons/plus";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type AddPetCardProps = {
  onPress?: () => void;
};

export function AddPetCard({ onPress }: AddPetCardProps) {
  const { t } = useTranslation(["home"]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("addPet.title")}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <PlusIcon width={22} height={22} color={palette.brand.primaryDefault} />
      </View>
      <Text style={styles.title}>{t("addPet.title")}</Text>
      <Text style={styles.subtitle}>{t("addPet.subtitle")}</Text>
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
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.palette.brand.surfaceBorder,
  },
  pressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
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
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
}));
