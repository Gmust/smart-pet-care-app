import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MealRule } from "../types";

import { CareListCard } from "./CareListCard";
import { MealRowContent } from "./MealRowContent";
import { RecurrenceChip } from "./RecurrenceChip";

type Props = {
  meals: MealRule[];
  onEditMeal?: (meal: MealRule) => void;
  onDeleteMeal?: (meal: MealRule) => void;
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
export function MealsListCard({ meals, onEditMeal, onDeleteMeal }: Props) {
  const [firstMeal] = meals;

  return (
    <CareListCard
      items={meals}
      keyExtractor={(meal) => meal.id}
      onItemPress={onEditMeal}
      onDeleteItem={onDeleteMeal}
      renderItem={(meal) => <MealRowContent title={meal.title} time={meal.time} />}
      footer={
        !!firstMeal && (
          <View style={styles.footerRow}>
            <RecurrenceChip
              recurrenceType={firstMeal.recurrenceType}
              weekDays={firstMeal.weekDays}
              variant="compact"
            />
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create(() => ({
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));
