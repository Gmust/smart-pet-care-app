import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useCareRulesQuery } from "../queries/useCareRulesQuery";
import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { CareCategory, CareRule } from "../types";
import { CareListCard } from "./CareListCard";
import { CareRuleCard } from "./CareRuleCard";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { EmptyCareRowContent } from "./EmptyCareRowContent";

type Props = {
  config: CareSectionConfig;
  petId: string;
  onAddRule?: (category: CareCategory) => void;
  onEditRule?: (rule: CareRule) => void;
};

type Slot =
  | { kind: "filled"; category: CareCategory; rule: CareRule; label: string }
  | { kind: "empty"; category: CareCategory; label: string };

export function CareRuleSection({ config, petId, onAddRule, onEditRule }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: rules, isLoading } = useCareRulesQuery(petId);
  const categories = config.fixedCareCategories ?? [];
  const actionLabel = config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined;
  const primaryCategory = categories[0];

  const handleHeaderAction = () => {
    if (primaryCategory) onAddRule?.(primaryCategory);
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
      const rule = rules?.find((item) => item.category === category);
      const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
      const label = labelKey ? t(labelKey) : category;
      return rule ? { kind: "filled", category, rule, label } : { kind: "empty", category, label };
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
            slot.kind === "filled" ? onEditRule?.(slot.rule) : onAddRule?.(slot.category)
          }
          renderItem={(slot) =>
            slot.kind === "filled" ? (
              <CareRuleRowContent
                category={slot.rule.category}
                title={slot.label}
                time={slot.rule.reminderTime}
                recurrenceType={slot.rule.recurrenceType}
                intervalN={slot.rule.intervalN}
                weekDays={slot.rule.weekDays}
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

  // "single" (VetVisit) and "growableList" (Weighing, Walking) share one
  // category and any number of free-titled rules. 0 → centered empty card,
  // 1 → standalone lg CareRuleCard, 2+ → collapse into one CareListCard.
  const categoryRules = primaryCategory
    ? (rules?.filter((item) => item.category === primaryCategory) ?? [])
    : [];

  return (
    <CareSection
      title={t(config.titleKey)}
      actionLabel={actionLabel}
      onActionPress={handleHeaderAction}
    >
      {categoryRules.length === 0 && <EmptyCareCard onPress={handleHeaderAction} />}
      {categoryRules.length === 1 && (
        <CareRuleCard
          category={categoryRules[0].category}
          title={categoryRules[0].title}
          time={categoryRules[0].reminderTime}
          recurrenceType={categoryRules[0].recurrenceType}
          intervalN={categoryRules[0].intervalN}
          weekDays={categoryRules[0].weekDays}
          size="lg"
          onPress={() => onEditRule?.(categoryRules[0])}
        />
      )}
      {categoryRules.length > 1 && (
        <CareListCard
          items={categoryRules}
          keyExtractor={(rule) => rule.id}
          onItemPress={(rule) => onEditRule?.(rule)}
          renderItem={(rule) => (
            <CareRuleRowContent
              category={rule.category}
              title={rule.title}
              time={rule.reminderTime}
              recurrenceType={rule.recurrenceType}
              intervalN={rule.intervalN}
              weekDays={rule.weekDays}
              size="sm"
            />
          )}
        />
      )}
    </CareSection>
  );
}
