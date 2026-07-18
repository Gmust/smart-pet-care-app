import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type CardPadding = "standalone" | "compact" | "none";

type Props = {
  padding?: CardPadding;
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
};

export const Card = ({ padding = "standalone", style, children }: Props) => {
  cardVariants.useVariants({ padding });

  return <View style={[cardVariants.card, style]}>{children}</View>;
};

export const cardVariants = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    variants: {
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
