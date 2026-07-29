import * as React from "react";
import type { TextStyle } from "react-native";
import { Text as RNText } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import * as Slot from "@rn-primitives/slot";

import type { theme } from "@/styles/theme";

const TextClassContext = React.createContext<TextStyle | undefined>(undefined);

export type TextVariant = Exclude<keyof typeof theme.textStyles, "chipMd" | "chipSm">;

type TextProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
  variant?: TextVariant;
};

function Text({ style, asChild = false, variant, ...props }: TextProps) {
  const contextStyles = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  styles.useVariants({ variant: variant ?? "none" });

  return <Component style={[styles.textBase, contextStyles, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  textBase: {
    color: theme.palette.black,
    variants: {
      variant: {
        none: {},
        display: { ...theme.textStyles.display },
        titleL: { ...theme.textStyles.titleL },
        titleM: { ...theme.textStyles.titleM },
        body: { ...theme.textStyles.body },
        bodyS: { ...theme.textStyles.bodyS },
        bodySemiBold: { ...theme.textStyles.bodySemiBold },
        label: { ...theme.textStyles.label },
        caption: { ...theme.textStyles.caption },
        tabLabelActive: { ...theme.textStyles.tabLabelActive },
        tabLabelInactive: { ...theme.textStyles.tabLabelInactive },
      } satisfies Record<TextVariant | "none", TextStyle>,
    },
  },
}));

export { Text, TextClassContext };
