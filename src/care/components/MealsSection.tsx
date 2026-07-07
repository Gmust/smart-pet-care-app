import { useTranslation } from "react-i18next";

import { useMealsQuery } from "../queries/useMealsQuery";
import type { MealRule } from "../types";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { MealsListCard } from "./MealsListCard";

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
      {!meals?.length ? (
        <EmptyCareCard onPress={onAddMeal} />
      ) : (
        <MealsListCard meals={meals} onEditMeal={onEditMeal} />
      )}
    </CareSection>
  );
}
