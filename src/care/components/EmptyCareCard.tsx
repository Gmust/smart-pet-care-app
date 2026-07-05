import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { CareCategory, PlannedHealthEventCategory } from "../types";
import { CareCategoryIcon } from "./care-category-icon/CareCategoryIcon";

type Props = {
  /** Only used by the row layout (title provided) to pick an icon. */
  category?: CareCategory | PlannedHealthEventCategory;
  /** Known label for fixed-slot rows (e.g. "Bathing"). Omit for single/growableList
   * sections where there's no per-row title yet (VetVisit, Weighing, Walking, Vaccination). */
  title?: string;
  onPress?: () => void;
};

export function EmptyCareCard({ category, title, onPress }: Props) {
  const { t } = useTranslation(["care"]);
  const { theme } = useUnistyles();

  if (!title) {
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t("emptyState.notConfigured")}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        {!!category && (
          <CareCategoryIcon
            category={category}
            width={16}
            height={16}
            color={theme.palette.brand.textFaint}
          />
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t("emptyState.notConfigured")}</Text>
      </View>
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
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    padding: theme.spacing(3),
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  iconBox: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  subtitle: {
    marginTop: theme.spacing(0.5),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textFaint,
  },
}));
