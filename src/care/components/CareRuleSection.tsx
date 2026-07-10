import { useTranslation } from "react-i18next";

import { CARE_CATEGORY_LABEL_KEYS, type CareSectionConfig } from "../constants";
import { useCareDeleteConfirm } from "../hooks/useCareDeleteConfirm";
import { useCareRulesQuery } from "../queries/useCareRulesQuery";
import { useDeleteCareRuleMutation } from "../queries/useDeleteCareRuleMutation";
import type { CareCategory, CareRule } from "../types";
import { CareCategorySection } from "./CareCategorySection";
import { CareDeleteConfirmDialog } from "./CareDeleteConfirmDialog";

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
  const deleteConfirm = useCareDeleteConfirm<CareRule>();

  return (
    <>
      <CareCategorySection<CareRule, CareCategory>
        title={t(config.titleKey)}
        actionLabel={config.headerActionLabelKey ? t(config.headerActionLabelKey) : undefined}
        variant={
          config.variant === "fixedSlots"
            ? "fixedSlots"
            : config.variant === "single"
              ? "single"
              : "growableList"
        }
        categories={config.fixedCareCategories ?? []}
        items={rules}
        isLoading={isLoading}
        notConfiguredLabel={t("emptyState.notConfigured")}
        getCategory={(rule) => rule.category}
        getCategoryLabel={(category) => {
          const labelKey = CARE_CATEGORY_LABEL_KEYS[category];
          return labelKey ? t(labelKey) : category;
        }}
        toRowProps={(rule, label) => ({
          category: rule.category,
          title: rule.title || label,
          time: rule.reminderTime,
          recurrenceType: rule.recurrenceType,
          intervalN: rule.intervalN,
          weekDays: rule.weekDays,
        })}
        onAdd={onAddRule}
        onEdit={onEditRule}
        onDelete={deleteConfirm.request}
      />

      <CareDeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        setIsOpen={(open) => !open && deleteConfirm.close()}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", {
          name: deleteConfirm.pendingItem?.title ?? "",
        })}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleteConfirm.pendingItem) return;
          await deleteRule({ id: deleteConfirm.pendingItem.id, petId });
        }}
      />
    </>
  );
}
