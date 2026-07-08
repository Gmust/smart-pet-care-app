import type { ReactNode } from "react";

import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { CareCategory, PlannedHealthEventCategory } from "../types";
import { CareListCard } from "./CareListCard";
import { CareRuleCard } from "./CareRuleCard";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";
import { EmptyCareRowContent } from "./EmptyCareRowContent";

type RowProps = Omit<React.ComponentProps<typeof CareRuleRowContent>, "size">;

type Slot<T, C extends CareCategory | PlannedHealthEventCategory> =
  | { kind: "filled"; category: C; item: T; label: string }
  | { kind: "empty"; category: C; label: string };

type Props<T extends { id: string }, C extends CareCategory | PlannedHealthEventCategory> = {
  title: string;
  actionLabel?: string;
  variant: "single" | "growableList" | "fixedSlots";
  categories: C[];
  items: T[] | undefined;
  isLoading: boolean;
  notConfiguredLabel: string;
  getCategory: (item: T) => C;
  getCategoryLabel: (category: C) => string;
  toRowProps: (item: T, label: string) => RowProps;
  onAdd?: (category: C) => void;
  onEdit?: (item: T) => void;
};

export function CareCategorySection<
  T extends { id: string },
  C extends CareCategory | PlannedHealthEventCategory,
>({
  title,
  actionLabel,
  variant,
  categories,
  items,
  isLoading,
  notConfiguredLabel,
  getCategory,
  getCategoryLabel,
  toRowProps,
  onAdd,
  onEdit,
}: Props<T, C>) {
  const primaryCategory = categories[0];
  const handleHeaderAction = () => {
    if (primaryCategory) onAdd?.(primaryCategory);
  };

  const wrap = (children: ReactNode) => (
    <CareSection title={title} actionLabel={actionLabel} onActionPress={handleHeaderAction}>
      {children}
    </CareSection>
  );

  if (isLoading) {
    return wrap(<CareListSkeleton rows={variant === "fixedSlots" ? categories.length : 2} />);
  }

  if (variant === "fixedSlots") {
    const slots: Slot<T, C>[] = categories.map((category) => {
      const item = items?.find((entry) => getCategory(entry) === category);
      const label = getCategoryLabel(category);
      return item ? { kind: "filled", category, item, label } : { kind: "empty", category, label };
    });

    return wrap(
      <CareListCard
        items={slots}
        keyExtractor={(slot) => slot.category}
        onItemPress={(slot) =>
          slot.kind === "filled" ? onEdit?.(slot.item) : onAdd?.(slot.category)
        }
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

  const categoryItems = primaryCategory
    ? (items?.filter((item) => getCategory(item) === primaryCategory) ?? [])
    : [];

  return wrap(
    <>
      {categoryItems.length === 0 && <EmptyCareCard onPress={handleHeaderAction} />}
      {categoryItems.length === 1 && (
        <CareRuleCard
          {...toRowProps(categoryItems[0], "")}
          size="lg"
          onPress={() => onEdit?.(categoryItems[0])}
        />
      )}
      {categoryItems.length > 1 && (
        <CareListCard
          items={categoryItems}
          keyExtractor={(item) => item.id}
          onItemPress={(item) => onEdit?.(item)}
          renderItem={(item) => <CareRuleRowContent {...toRowProps(item, "")} size="sm" />}
        />
      )}
    </>
  );
}
