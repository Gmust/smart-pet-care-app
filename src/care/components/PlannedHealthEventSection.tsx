import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { usePlannedHealthEventsQuery } from "../queries/usePlannedHealthEventsQuery";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../types";
import { CareRuleCard } from "./CareRuleCard";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";

type Props = {
  config: CareSectionConfig;
  petId: string;
  onAddEvent?: (category: PlannedHealthEventCategory) => void;
  onEditEvent?: (event: PlannedHealthEvent) => void;
};

/** PlannedHealthEvent only ever repeats "every N months" — there's no separate
 * recurrenceType field on the entity (see types.ts), so the chip is fed a
 * fixed "EveryNMonths" here. */
const PLANNED_HEALTH_EVENT_RECURRENCE = "EveryNMonths" as const;

export function PlannedHealthEventSection({ config, petId, onAddEvent, onEditEvent }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: events } = usePlannedHealthEventsQuery(petId);
  const categories = config.fixedPlannedHealthCategories ?? [];
  const actionLabel = config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined;
  const primaryCategory = categories[0];

  const handleHeaderAction = () => {
    if (primaryCategory) onAddEvent?.(primaryCategory);
  };

  if (config.variant === "fixedSlots") {
    return (
      <CareSection
        title={t(config.titleKey)}
        actionLabel={actionLabel}
        onActionPress={handleHeaderAction}
      >
        {categories.map((category) => {
          const event = events?.find((item) => item.category === category);
          const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
          const categoryLabel = labelKey ? t(labelKey) : category;

          return event ? (
            <CareRuleCard
              key={category}
              category={event.category}
              title={event.title || categoryLabel}
              time={event.reminderTime}
              recurrenceType={PLANNED_HEALTH_EVENT_RECURRENCE}
              intervalN={event.intervalN}
              size="sm"
              onPress={() => onEditEvent?.(event)}
            />
          ) : (
            <EmptyCareCard
              key={category}
              category={category}
              title={categoryLabel}
              onPress={() => onAddEvent?.(category)}
            />
          );
        })}
      </CareSection>
    );
  }

  // growableList (Vaccination): one category, any number of free-titled events.
  const categoryEvents = primaryCategory
    ? (events?.filter((item) => item.category === primaryCategory) ?? [])
    : [];

  return (
    <CareSection
      title={t(config.titleKey)}
      actionLabel={actionLabel}
      onActionPress={handleHeaderAction}
    >
      {categoryEvents.length === 0 && (
        <EmptyCareCard category={primaryCategory} onPress={handleHeaderAction} />
      )}
      {categoryEvents.map((event) => (
        <CareRuleCard
          key={event.id}
          category={event.category}
          title={event.title}
          time={event.reminderTime}
          recurrenceType={PLANNED_HEALTH_EVENT_RECURRENCE}
          intervalN={event.intervalN}
          size={categoryEvents.length > 1 ? "sm" : "lg"}
          onPress={() => onEditEvent?.(event)}
        />
      ))}
    </CareSection>
  );
}
