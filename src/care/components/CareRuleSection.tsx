import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useCareRulesQuery } from "../queries/useCareRulesQuery";
import { useDeleteCareRuleMutation } from "../queries/useDeleteCareRuleMutation";
import type { CareCategory, CareRule } from "../types";
import { CareDeleteFlow } from "./CareDeleteFlow";
import { CareFixedSlotsSection } from "./CareFixedSlotsSection";
import { CareListSection } from "./CareListSection";

type Props = {
  config: CareSectionConfig;
  petId: string;
  onAddRule?: (category: CareCategory) => void;
  onEditRule?: (rule: CareRule) => void;
};

export function CareRuleSection({ config, petId, onAddRule, onEditRule }: Props) {
  const { t } = useTranslation(["care"]);
  const { data: rules, isLoading } = useCareRulesQuery(petId);
  const { mutateAsync: deleteRule, isPending: isDeleting } = useDeleteCareRuleMutation();

  const commonProps = {
    title: t(config.titleKey),
    actionLabel: config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined,
    categories: config.fixedCareCategories ?? [],
    items: rules,
    isLoading,
    getCategory: (rule: CareRule) => rule.category,
    toRowProps: (rule: CareRule, label: string) => ({
      category: rule.category,
      title: rule.title || label,
      time: rule.reminderTime,
      recurrenceType: rule.recurrenceType,
      intervalN: rule.intervalN,
      weekDays: rule.weekDays,
    }),
    onAdd: onAddRule,
    onEdit: onEditRule,
  };

  return (
    <CareDeleteFlow<CareRule>
      petId={petId}
      deleteItem={deleteRule}
      isDeleting={isDeleting}
      getName={(rule) => rule.title}
    >
      {(requestDelete) =>
        config.variant === "fixedSlots" ? (
          <CareFixedSlotsSection<CareRule, CareCategory>
            {...commonProps}
            notConfiguredLabel={t("emptyState.notConfigured")}
            getCategoryLabel={(category) => {
              const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
              return labelKey ? t(labelKey) : category;
            }}
            onDelete={requestDelete}
          />
        ) : (
          <CareListSection<CareRule, CareCategory> {...commonProps} onDelete={requestDelete} />
        )
      }
    </CareDeleteFlow>
  );
}
