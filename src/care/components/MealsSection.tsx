import { useTranslation } from "react-i18next";

import { useMealsQuery } from "../queries/useMealsQuery";
import type { MealRule } from "../types";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { MealRow } from "./MealRow";

type Props = {
  petId: string;
  onAddMeal?: () => void;
  onEditMeal?: (meal: MealRule) => void;
};

export function MealsSection({ petId, onAddMeal, onEditMeal }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: meals } = useMealsQuery(petId);

  return (
    <CareSection
      title={t("sections.meals.title")}
      actionLabel={t("sections.meals.editAction")}
      onActionPress={onAddMeal}
    >
      {!meals?.length && <EmptyCareCard onPress={onAddMeal} />}
      {meals?.map((meal) => (
        <MealRow key={meal.id} meal={meal} onPress={() => onEditMeal?.(meal)} />
      ))}
    </CareSection>
  );
}
