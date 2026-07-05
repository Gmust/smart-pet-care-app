import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { MealRule } from "../types";
import { RecurrenceChip } from "./RecurrenceChip";

type Props = {
  meal: MealRule;
  onPress?: () => void;
};

export function MealRow({ meal, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meal.title}, ${meal.time}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.title}>{meal.title}</Text>
      <View style={styles.right}>
        <Text style={styles.time}>{meal.time}</Text>
        <RecurrenceChip
          recurrenceType={meal.recurrenceType}
          weekDays={meal.weekDays}
          variant="compact"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  rowPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  title: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  right: {
    alignItems: "flex-end",
    gap: theme.spacing(1),
  },
  time: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
}));
