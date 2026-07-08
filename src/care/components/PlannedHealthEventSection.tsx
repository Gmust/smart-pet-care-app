import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { usePlannedHealthEventsQuery } from "../queries/usePlannedHealthEventsQuery";
import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../types";
import { CareListCard } from "./CareListCard";
import { CareRuleCard } from "./CareRuleCard";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { EmptyCareRowContent } from "./EmptyCareRowContent";

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

type Slot =
  | {
      kind: "filled";
      category: PlannedHealthEventCategory;
      event: PlannedHealthEvent;
      label: string;
    }
  | { kind: "empty"; category: PlannedHealthEventCategory; label: string };

export function PlannedHealthEventSection({ config, petId, onAddEvent, onEditEvent }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: events, isLoading } = usePlannedHealthEventsQuery(petId);
  const categories = config.fixedPlannedHealthCategories ?? [];
  const actionLabel = config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined;
  const primaryCategory = categories[0];

  const handleHeaderAction = () => {
    if (primaryCategory) onAddEvent?.(primaryCategory);
  };

  if (isLoading) {
    return (
      <CareSection
        title={t(config.titleKey)}
        actionLabel={actionLabel}
        onActionPress={handleHeaderAction}
      >
        <CareListSkeleton rows={config.variant === "fixedSlots" ? categories.length : 2} />
      </CareSection>
    );
  }

  if (config.variant === "fixedSlots") {
    const slots: Slot[] = categories.map((category) => {
      const event = events?.find((item) => item.category === category);
      const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
      const label = labelKey ? t(labelKey) : category;
      return event
        ? { kind: "filled", category, event, label }
        : { kind: "empty", category, label };
    });

    return (
      <CareSection
        title={t(config.titleKey)}
        actionLabel={actionLabel}
        onActionPress={handleHeaderAction}
      >
        <CareListCard
          items={slots}
          keyExtractor={(slot) => slot.category}
          onItemPress={(slot) =>
            slot.kind === "filled" ? onEditEvent?.(slot.event) : onAddEvent?.(slot.category)
          }
          renderItem={(slot) =>
            slot.kind === "filled" ? (
              <CareRuleRowContent
                category={slot.event.category}
                title={slot.event.title || slot.label}
                time={slot.event.reminderTime}
                recurrenceType={PLANNED_HEALTH_EVENT_RECURRENCE}
                intervalN={slot.event.intervalN}
                size="sm"
              />
            ) : (
              <EmptyCareRowContent
                category={slot.category}
                title={slot.label}
                notConfiguredLabel={t("emptyState.notConfigured")}
              />
            )
          }
        />
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
      {categoryEvents.length === 0 && <EmptyCareCard onPress={handleHeaderAction} />}
      {categoryEvents.length === 1 && (
        <CareRuleCard
          category={categoryEvents[0].category}
          title={categoryEvents[0].title}
          time={categoryEvents[0].reminderTime}
          recurrenceType={PLANNED_HEALTH_EVENT_RECURRENCE}
          intervalN={categoryEvents[0].intervalN}
          size="lg"
          onPress={() => onEditEvent?.(categoryEvents[0])}
        />
      )}
      {categoryEvents.length > 1 && (
        <CareListCard
          items={categoryEvents}
          keyExtractor={(event) => event.id}
          onItemPress={(event) => onEditEvent?.(event)}
          renderItem={(event) => (
            <CareRuleRowContent
              category={event.category}
              title={event.title}
              time={event.reminderTime}
              recurrenceType={PLANNED_HEALTH_EVENT_RECURRENCE}
              intervalN={event.intervalN}
              size="sm"
            />
          )}
        />
      )}
    </CareSection>
  );
}
