import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { CareCategory, PlannedHealthEventCategory } from "../types";

import { CareListCard } from "./CareListCard";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { CareSection } from "./CareSection";
import { EmptyCareRowContent } from "./EmptyCareRowContent";

type RowProps = Omit<React.ComponentProps<typeof CareRuleRowContent>, "size">;

type Slot<T, C extends CareCategory | PlannedHealthEventCategory> =
  | { kind: "filled"; category: C; item: T; label: string }
  | { kind: "empty"; category: C; label: string };

type Props<T extends { id: string }, C extends CareCategory | PlannedHealthEventCategory> = {
  title: string;
  actionLabel?: string;
  categories: C[];
  items: T[] | undefined;
  isLoading: boolean;
  notConfiguredLabel: string;
  getCategory: (item: T) => C;
  getCategoryLabel: (category: C) => string;
  toRowProps: (item: T, label: string) => RowProps;
  onAdd?: (category: C) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

export function CareFixedSlotsSection<
  T extends { id: string },
  C extends CareCategory | PlannedHealthEventCategory,
>({
  title,
  actionLabel,
  categories,
  items,
  isLoading,
  notConfiguredLabel,
  getCategory,
  getCategoryLabel,
  toRowProps,
  onAdd,
  onEdit,
  onDelete,
}: Props<T, C>) {
  const primaryCategory = categories[0];
  const handleHeaderAction = () => {
    if (!primaryCategory) return;
    onAdd?.(primaryCategory);
  };

  let content;
  if (isLoading) {
    content = <CareListSkeleton rows={categories.length} />;
  } else {
    const slots: Slot<T, C>[] = categories.map((category) => {
      const item = items?.find((entry) => getCategory(entry) === category);
      const label = getCategoryLabel(category);
      return item ? { kind: "filled", category, item, label } : { kind: "empty", category, label };
    });

    content = (
      <CareListCard
        items={slots}
        keyExtractor={(slot) => slot.category}
        onItemPress={(slot) =>
          slot.kind === "filled" ? onEdit?.(slot.item) : onAdd?.(slot.category)
        }
        onDeleteItem={(slot) => slot.kind === "filled" && onDelete?.(slot.item)}
        isDeleteDisabled={(slot) => slot.kind === "empty"}
        renderItem={(slot) =>
          slot.kind === "filled" ? (
            <CareRuleRowContent
              {...toRowProps(slot.item, slot.label)}
              title={slot.label}
              size="sm"
            />
          ) : (
            <EmptyCareRowContent
              category={slot.category}
              title={slot.label}
              notConfiguredLabel={notConfiguredLabel}
            />
          )
        }
      />
    );
  }

  return (
    <CareSection title={title} actionLabel={actionLabel} onActionPress={handleHeaderAction}>
      {content}
    </CareSection>
  );
}
