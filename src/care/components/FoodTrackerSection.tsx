import { useTranslation } from "react-i18next";

import { useCareDeleteConfirm } from "../hooks/useCareDeleteConfirm";
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
  const deleteConfirm = useCareDeleteConfirm<FoodTracker>();

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
                onDelete={() => deleteConfirm.request(tracker)}
              />
            ))}
          </>
        )}
      </CareSection>

      <CareDeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        setIsOpen={(open) => !open && deleteConfirm.close()}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", {
          name: deleteConfirm.pendingItem?.foodName ?? "",
        })}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleteConfirm.pendingItem) return;
          await deleteTracker({ id: deleteConfirm.pendingItem.id, petId });
        }}
      />
    </>
  );
}
