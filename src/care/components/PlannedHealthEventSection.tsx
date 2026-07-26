import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useCareDelete } from "../hooks/useCareDelete";
import { useDeletePlannedHealthEventMutation } from "../queries/useDeletePlannedHealthEventMutation";
import { usePlannedHealthEventsQuery } from "../queries/usePlannedHealthEventsQuery";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../types";
import { CareDeleteConfirmDialog } from "./CareDeleteConfirmDialog";
import { CareFixedSlotsSection } from "./CareFixedSlotsSection";
import { CareListSection } from "./CareListSection";

const PLANNED_HEALTH_EVENT_RECURRENCE = "EveryNMonths" as const;

type Props = {
  config: CareSectionConfig;
  petId: string;
  onAddEvent?: (category: PlannedHealthEventCategory) => void;
  onEditEvent?: (event: PlannedHealthEvent) => void;
};

export function PlannedHealthEventSection({ config, petId, onAddEvent, onEditEvent }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: events, isLoading } = usePlannedHealthEventsQuery(petId);
  const { mutateAsync: deleteEvent, isPending: isDeleting } = useDeletePlannedHealthEventMutation();
  const { requestDelete, dialogProps } = useCareDelete({
    petId,
    deleteItem: deleteEvent,
    isDeleting,
  });

  const commonProps = {
    title: t(config.titleKey),
    actionLabel: config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined,
    categories: config.fixedPlannedHealthCategories ?? [],
    items: events,
    isLoading,
    getCategory: (event: PlannedHealthEvent) => event.category,
    toRowProps: (event: PlannedHealthEvent, label: string) => ({
      category: event.category,
      title: event.title || label,
      time: event.reminderTime,
      recurrenceType: PLANNED_HEALTH_EVENT_RECURRENCE,
      intervalN: event.intervalN,
    }),
    onAdd: onAddEvent,
    onEdit: onEditEvent,
    onDelete: (event: PlannedHealthEvent) => requestDelete({ id: event.id, name: event.title }),
  };

  return (
    <>
      {config.variant === "fixedSlots" ? (
        <CareFixedSlotsSection<PlannedHealthEvent, PlannedHealthEventCategory>
          {...commonProps}
          notConfiguredLabel={t("emptyState.notConfigured")}
          getCategoryLabel={(category) => {
            const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
            return labelKey ? t(labelKey) : category;
          }}
        />
      ) : (
        <CareListSection<PlannedHealthEvent, PlannedHealthEventCategory> {...commonProps} />
      )}

      <CareDeleteConfirmDialog {...dialogProps} />
    </>
  );
}
