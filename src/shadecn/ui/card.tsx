import { Children, type ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type CardPadding = "standalone" | "compact" | "none";
type CardRadius = "standalone" | "loose";

type CardBaseProps = {
  padding?: CardPadding;
  radius?: CardRadius;
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
};

type CardInteractionProps =
  | { onPress?: undefined; accessibilityLabel?: undefined }
  | { onPress: () => void; accessibilityLabel: string };

type CardProps = CardBaseProps & CardInteractionProps;

export const Card = ({
  padding = "standalone",
  radius = "standalone",
  style,
  children,
  onPress,
  accessibilityLabel,
}: CardProps) => {
  cardVariants.useVariants({ padding, radius });

  if (!onPress) {
    return <View style={[cardVariants.card, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardVariants.card, style, pressed && cardVariants.pressed]}
    >
      {children}
    </Pressable>
  );
};

export const cardVariants = StyleSheet.create((theme) => ({
  pressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  card: {
    backgroundColor: theme.palette.white,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    overflow: "hidden",
    variants: {
      radius: {
        standalone: { borderRadius: theme.borderRadius.xl },
        loose: { borderRadius: theme.borderRadius["2xl"] },
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
  cardVariants.useVariants({ padding: "none", radius: "loose" });
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
