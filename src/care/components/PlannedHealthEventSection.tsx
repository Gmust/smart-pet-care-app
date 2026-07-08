import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { usePlannedHealthEventsQuery } from "../queries/usePlannedHealthEventsQuery";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../types";
import { CareCategorySection } from "./CareCategorySection";

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

  return (
    <CareCategorySection<PlannedHealthEvent, PlannedHealthEventCategory>
      title={t(config.titleKey)}
      actionLabel={config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined}
      variant={config.variant === "fixedSlots" ? "fixedSlots" : "growableList"}
      categories={config.fixedPlannedHealthCategories ?? []}
      items={events}
      isLoading={isLoading}
      notConfiguredLabel={t("emptyState.notConfigured")}
      getCategory={(event) => event.category}
      getCategoryLabel={(category) => {
        const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
        return labelKey ? t(labelKey) : category;
      }}
      toRowProps={(event, label) => ({
        category: event.category,
        title: event.title || label,
        time: event.reminderTime,
        recurrenceType: PLANNED_HEALTH_EVENT_RECURRENCE,
        intervalN: event.intervalN,
      })}
      onAdd={onAddEvent}
      onEdit={onEditEvent}
    />
  );
}
