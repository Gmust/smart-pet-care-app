import { Children, type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type CardPadding = "standalone" | "compact" | "none";
type CardRadius = "standalone" | "list";

type CardProps = {
  padding?: CardPadding;
  radius?: CardRadius;
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
};

export const Card = ({
  padding = "standalone",
  radius = "standalone",
  style,
  children,
}: CardProps) => {
  cardVariants.useVariants({ padding, radius });

  return <View style={[cardVariants.card, style]}>{children}</View>;
};

export const cardVariants = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.palette.white,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    overflow: "hidden",
    variants: {
      radius: {
        standalone: { borderRadius: theme.borderRadius.xl },
        list: { borderRadius: theme.borderRadius["2xl"] },
      },
      padding: {
        standalone: {
          paddingHorizontal: theme.spacing(4),
          paddingVertical: theme.spacing(2.5),
        },
        compact: {
          paddingHorizontal: theme.spacing(3.5),
          paddingVertical: theme.spacing(2.75),
        },
        none: {},
      },
    },
  },
}));

type ListCardProps = {
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
};

export const ListCard = ({ style, children }: ListCardProps) => {
  cardVariants.useVariants({ padding: "none", radius: "list" });
  const items = Children.toArray(children);

  return (
    <View style={[cardVariants.card, style]}>
      {items.map((child, index) => (
        <View
          key={(child as { key?: string }).key ?? index}
          style={index > 0 && listCardStyles.divider}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const listCardStyles = StyleSheet.create((theme) => ({
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
  },
}));
