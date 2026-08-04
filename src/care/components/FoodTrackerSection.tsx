import { useTranslation } from "react-i18next";

import { useCareDelete } from "../hooks/useCareDelete";
import { useDeleteFoodTrackerMutation } from "../queries/useDeleteFoodTrackerMutation";
import { useFoodTrackerQuery } from "../queries/useFoodTrackerQuery";
import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { FoodTracker } from "../types";

import { CareDeleteConfirmDialog } from "./CareDeleteConfirmDialog";
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
  const { requestDelete, dialogProps } = useCareDelete({
    petId,
    deleteItem: deleteTracker,
    isDeleting,
  });

  return (
    <>
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
                onDelete={() => requestDelete({ id: tracker.id, name: tracker.foodName })}
              />
            ))}
          </>
        )}
      </CareSection>

      <CareDeleteConfirmDialog {...dialogProps} />
    </>
  );
}
