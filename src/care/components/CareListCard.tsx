import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SwipeToDeleteRow } from "./SwipeToDeleteRow";

export const careListCardStyles = StyleSheet.create((theme) => ({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.white,
  },
  row: {
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
  },
  rowPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));

type Props<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onItemPress?: (item: T) => void;
  onDeleteItem?: (item: T) => void;
  isDeleteDisabled?: (item: T) => boolean;
};

/**
 * One bordered card, rows separated by internal dividers instead of each
 * item getting its own outer border. Used for fixedSlots sections (always)
 * and growableList sections once they hold 2+ rules. FoodTracker is exempt
 * by design — every food item stays its own standalone card.
 */
export function CareListCard<T>({
  items,
  keyExtractor,
  renderItem,
  onItemPress,
  onDeleteItem,
  isDeleteDisabled,
}: Props<T>) {
  const { theme } = useUnistyles();

  return (
    <View style={careListCardStyles.card}>
      {items.map((item, index) => (
        <SwipeToDeleteRow
          key={keyExtractor(item)}
          disabled={!onDeleteItem || isDeleteDisabled?.(item)}
          onDelete={() => onDeleteItem?.(item)}
          topRadius={index === 0 ? theme.borderRadius.xl : 0}
          bottomRadius={index === items.length - 1 ? theme.borderRadius.xl : 0}
        >
          <Pressable
            disabled={!onItemPress}
            onPress={() => onItemPress?.(item)}
            style={({ pressed }) => [
              careListCardStyles.row,
              index > 0 && careListCardStyles.divider,
              pressed && !!onItemPress && careListCardStyles.rowPressed,
            ]}
          >
            {renderItem(item)}
          </Pressable>
        </SwipeToDeleteRow>
      ))}
    </View>
  );
}
