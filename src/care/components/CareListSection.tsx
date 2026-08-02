import { CareListSkeleton } from "../skeletons/CareListSkeleton";
import type { CareCategory } from "../types";

import { CareListCard } from "./CareListCard";
import { CareRuleCard } from "./CareRuleCard";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { CareSection } from "./CareSection";
import { EmptyCareCard } from "./EmptyCareCard";

type RowProps = Omit<React.ComponentProps<typeof CareRuleRowContent>, "size">;

type Props<T extends { id: string }, C extends CareCategory> = {
  title: string;
  actionLabel?: string;
  categories: C[];
  items: T[] | undefined;
  isLoading: boolean;
  getCategory: (item: T) => C;
  toRowProps: (item: T, label: string) => RowProps;
  onAdd?: (category: C) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

export function CareListSection<T extends { id: string }, C extends CareCategory>({
  title,
  actionLabel,
  categories,
  items,
  isLoading,
  getCategory,
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
    content = <CareListSkeleton rows={2} />;
  } else {
    const categoryItems = primaryCategory
      ? (items?.filter((item) => getCategory(item) === primaryCategory) ?? [])
      : [];

    if (categoryItems.length === 0) {
      content = <EmptyCareCard onPress={handleHeaderAction} />;
    } else if (categoryItems.length === 1) {
      content = (
        <CareRuleCard
          {...toRowProps(categoryItems[0], "")}
          size="lg"
          onPress={() => onEdit?.(categoryItems[0])}
          onDelete={() => onDelete?.(categoryItems[0])}
        />
      );
    } else {
      content = (
        <CareListCard
          items={categoryItems}
          keyExtractor={(item) => item.id}
          onItemPress={(item) => onEdit?.(item)}
          onDeleteItem={(item) => onDelete?.(item)}
          renderItem={(item) => <CareRuleRowContent {...toRowProps(item, "")} size="sm" />}
        />
      );
    }
  }

  return (
    <CareSection title={title} actionLabel={actionLabel} onActionPress={handleHeaderAction}>
      {content}
    </CareSection>
  );
}
