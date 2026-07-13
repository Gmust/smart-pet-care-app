import { useTranslation } from "react-i18next";

import { useDeleteMealMutation } from "../queries/useDeleteMealMutation";
import { useMealsQuery } from "../queries/useMealsQuery";
import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { MealRule } from "../types";
import { CareDeleteFlow } from "./CareDeleteFlow";
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
  const { data: meals, isLoading } = useMealsQuery(petId);
  const { mutateAsync: deleteMeal, isPending: isDeleting } = useDeleteMealMutation();

  return (
    <CareDeleteFlow<MealRule>
      petId={petId}
      deleteItem={deleteMeal}
      isDeleting={isDeleting}
      getName={(meal) => meal.title}
    >
      {(requestDelete) => (
        <CareSection
          title={t("sections.meals.title")}
          actionLabel={t("sections.meals.addAction")}
          onActionPress={onAddMeal}
        >
          {isLoading ? (
            <CareListSkeleton rows={2} />
          ) : !meals?.length ? (
            <EmptyCareCard onPress={onAddMeal} />
          ) : (
            <MealsListCard meals={meals} onEditMeal={onEditMeal} onDeleteMeal={requestDelete} />
          )}
        </CareSection>
      )}
    </CareDeleteFlow>
  );
}
