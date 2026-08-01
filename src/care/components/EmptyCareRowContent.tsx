import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { CareCategory, PlannedHealthEventCategory } from "../types";

import { CareCategoryIcon } from "./care-category-icon/CareCategoryIcon";

type Props = {
  category: CareCategory | PlannedHealthEventCategory;
  title: string;
  notConfiguredLabel: string;
};

export function EmptyCareRowContent({ category, title, notConfiguredLabel }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <CareCategoryIcon
          category={category}
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={theme.palette.brand.textFaint}
        />
      </View>
      <View style={styles.textCol}>
        <Text variant="bodyS" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" style={styles.subtitle}>
          {notConfiguredLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
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
    color: theme.palette.brand.textSecondary,
  },
  subtitle: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.brand.textFaint,
  },
}));
