import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useDeletePlannedHealthEventMutation } from "../queries/useDeletePlannedHealthEventMutation";
import { usePlannedHealthEventsQuery } from "../queries/usePlannedHealthEventsQuery";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../types";
import { CareDeleteFlow } from "./CareDeleteFlow";
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
  };

  return (
    <CareDeleteFlow<PlannedHealthEvent>
      petId={petId}
      deleteItem={deleteEvent}
      isDeleting={isDeleting}
      getName={(event) => event.title}
    >
      {(requestDelete) =>
        config.variant === "fixedSlots" ? (
          <CareFixedSlotsSection<PlannedHealthEvent, PlannedHealthEventCategory>
            {...commonProps}
            notConfiguredLabel={t("emptyState.notConfigured")}
            getCategoryLabel={(category) => {
              const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
              return labelKey ? t(labelKey) : category;
            }}
            onDelete={requestDelete}
          />
        ) : (
          <CareListSection<PlannedHealthEvent, PlannedHealthEventCategory>
            {...commonProps}
            onDelete={requestDelete}
          />
        )
      }
    </CareDeleteFlow>
  );
}
