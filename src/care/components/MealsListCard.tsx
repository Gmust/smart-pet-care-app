import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MealRule } from "../types";
import { careListCardStyles } from "./CareListCard";
import { MealRowContent } from "./MealRowContent";
import { RecurrenceChip } from "./RecurrenceChip";

type Props = {
  meals: MealRule[];
  onEditMeal?: (meal: MealRule) => void;
};

/**
 * Meals is always a single merged card (never a stack of per-meal cards):
 * one row per meal, then a footer row holding the shared recurrence chip.
 *
 * The footer reflects the first meal's recurrence. That's exact today,
 * since every meal is created as "Daily" until per-weekday advanced
 * settings ship (see MealsSection / mealSchema) — at that point this
 * footer will need revisiting if meals can genuinely diverge.
 */
export function MealsListCard({ meals, onEditMeal }: Props) {
  const [firstMeal] = meals;

  return (
    <View style={careListCardStyles.card}>
      {meals.map((meal, index) => (
        <Pressable
          key={meal.id}
          onPress={() => onEditMeal?.(meal)}
          style={({ pressed }) => [
            careListCardStyles.row,
            index > 0 && careListCardStyles.divider,
            pressed && careListCardStyles.rowPressed,
          ]}
        >
          <MealRowContent title={meal.title} time={meal.time} />
        </Pressable>
      ))}

      {!!firstMeal && (
        <View
          style={[
            careListCardStyles.row,
            meals.length > 0 && careListCardStyles.divider,
            styles.footerRow,
          ]}
        >
          <RecurrenceChip
            recurrenceType={firstMeal.recurrenceType}
            weekDays={firstMeal.weekDays}
            variant="compact"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));
