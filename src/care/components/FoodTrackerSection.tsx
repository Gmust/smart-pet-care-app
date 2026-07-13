import { useTranslation } from "react-i18next";

import { useDeleteFoodTrackerMutation } from "../queries/useDeleteFoodTrackerMutation";
import { useFoodTrackerQuery } from "../queries/useFoodTrackerQuery";
import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { FoodTracker } from "../types";
import { CareDeleteFlow } from "./CareDeleteFlow";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { FoodTrackerCard } from "./FoodTrackerCard";

type Props = {
  petId: string;
  onAddFood?: () => void;
  onEditFood?: (tracker: FoodTracker) => void;
};

export function FoodTrackerSection({ petId, onAddFood, onEditFood }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: trackers, isLoading } = useFoodTrackerQuery(petId);
  const { mutateAsync: deleteTracker, isPending: isDeleting } = useDeleteFoodTrackerMutation();

  return (
    <CareDeleteFlow<FoodTracker>
      petId={petId}
      deleteItem={deleteTracker}
      isDeleting={isDeleting}
      getName={(tracker) => tracker.foodName}
    >
      {(requestDelete) => (
        <CareSection
          title={t("sections.foodTracker.title")}
          actionLabel={t("sections.foodTracker.addAction")}
          onActionPress={onAddFood}
        >
          {isLoading ? (
            <CareListSkeleton rows={2} />
          ) : (
            <>
              {!trackers?.length && <EmptyCareCard onPress={onAddFood} />}
              {trackers?.map((tracker) => (
                <FoodTrackerCard
                  key={tracker.id}
                  tracker={tracker}
                  onPress={() => onEditFood?.(tracker)}
                  onDelete={() => requestDelete(tracker)}
                />
              ))}
            </>
          )}
        </CareSection>
      )}
    </CareDeleteFlow>
  );
}
