import { useTranslation } from "react-i18next";

import { useFoodTrackerQuery } from "../queries/useFoodTrackerQuery";
import type { FoodTracker } from "../types";
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
  const { data: trackers } = useFoodTrackerQuery(petId);

  return (
    <CareSection
      title={t("sections.foodTracker.title")}
      actionLabel={t("sections.foodTracker.addAction")}
      onActionPress={onAddFood}
    >
      {!trackers?.length && <EmptyCareCard onPress={onAddFood} />}
      {trackers?.map((tracker) => (
        <FoodTrackerCard key={tracker.id} tracker={tracker} onPress={() => onEditFood?.(tracker)} />
      ))}
    </CareSection>
  );
}
