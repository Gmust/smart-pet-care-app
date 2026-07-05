import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useCareRulesQuery } from "../queries/useCareRulesQuery";
import type { CareCategory, CareRule } from "../types";
import { CareRuleCard } from "./CareRuleCard";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";

type Props = {
  config: CareSectionConfig;
  petId: string;
  onAddRule?: (category: CareCategory) => void;
  onEditRule?: (rule: CareRule) => void;
};

export function CareRuleSection({ config, petId, onAddRule, onEditRule }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: rules } = useCareRulesQuery(petId);
  const categories = config.fixedCareCategories ?? [];
  const actionLabel = config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined;
  const primaryCategory = categories[0];

  const handleHeaderAction = () => {
    if (primaryCategory) onAddRule?.(primaryCategory);
  };

  if (config.variant === "fixedSlots") {
    return (
      <CareSection
        title={t(config.titleKey)}
        actionLabel={actionLabel}
        onActionPress={handleHeaderAction}
      >
        {categories.map((category) => {
          const rule = rules?.find((item) => item.category === category);
          const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
          const categoryLabel = labelKey ? t(labelKey) : category;

          return rule ? (
            <CareRuleCard
              key={category}
              category={rule.category}
              title={categoryLabel}
              time={rule.reminderTime}
              recurrenceType={rule.recurrenceType}
              intervalN={rule.intervalN}
              weekDays={rule.weekDays}
              size="sm"
              onPress={() => onEditRule?.(rule)}
            />
          ) : (
            <EmptyCareCard
              key={category}
              category={category}
              title={categoryLabel}
              onPress={() => onAddRule?.(category)}
            />
          );
        })}
      </CareSection>
    );
  }

  // "single" (VetVisit) and "growableList" (Weighing, Walking) share one
  // category and any number of free-titled rules; size flips to "sm" once
  // a second rule is added.
  const categoryRules = primaryCategory
    ? (rules?.filter((item) => item.category === primaryCategory) ?? [])
    : [];

  return (
    <CareSection
      title={t(config.titleKey)}
      actionLabel={actionLabel}
      onActionPress={handleHeaderAction}
    >
      {categoryRules.length === 0 && (
        <EmptyCareCard category={primaryCategory} onPress={handleHeaderAction} />
      )}
      {categoryRules.map((rule) => (
        <CareRuleCard
          key={rule.id}
          category={rule.category}
          title={rule.title}
          time={rule.reminderTime}
          recurrenceType={rule.recurrenceType}
          intervalN={rule.intervalN}
          weekDays={rule.weekDays}
          size={categoryRules.length > 1 ? "sm" : "lg"}
          onPress={() => onEditRule?.(rule)}
        />
      ))}
    </CareSection>
  );
}
