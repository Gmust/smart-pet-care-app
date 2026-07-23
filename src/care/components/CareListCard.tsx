import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { cardVariants } from "@/shadecn/ui/card";

import { SwipeToDeleteRow } from "./SwipeToDeleteRow";

const careListCardStyles = StyleSheet.create((theme) => ({
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
  footer?: ReactNode;
};

export function CareListCard<T>({
  items,
  keyExtractor,
  renderItem,
  onItemPress,
  onDeleteItem,
  isDeleteDisabled,
  footer,
}: Props<T>) {
  const { theme } = useUnistyles();
  cardVariants.useVariants({ padding: "none", radius: "list" });

  return (
    <View style={[cardVariants.card]}>
      {items.map((item, index) => (
        <SwipeToDeleteRow
          key={keyExtractor(item)}
          disabled={!onDeleteItem || isDeleteDisabled?.(item)}
          onDelete={() => onDeleteItem?.(item)}
          topRadius={index === 0 ? theme.borderRadius["2xl"] : 0}
          bottomRadius={!footer && index === items.length - 1 ? theme.borderRadius["2xl"] : 0}
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

      {!!footer && (
        <View style={[careListCardStyles.row, items.length > 0 && careListCardStyles.divider]}>
          {footer}
        </View>
      )}
    </View>
  );
}
