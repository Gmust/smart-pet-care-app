import * as React from "react";
import type { TextStyle } from "react-native";
import { Text as RNText } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import * as Slot from "@rn-primitives/slot";

import type { theme as appTheme } from "@/styles/theme";

const TextClassContext = React.createContext<TextStyle | undefined>(undefined);

export type TextVariant = Exclude<keyof typeof appTheme.textStyles, "chipMd" | "chipSm">;

type TextProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
  variant?: TextVariant;
};

function Text({ style, asChild = false, variant, ...props }: TextProps) {
  const contextStyles = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;

  return <Component style={[styles.base, contextStyles, styles.role(variant), style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  base: { color: theme.palette.black },
  role: (variant?: TextVariant) => (variant ? theme.textStyles[variant] : {}),
}));

export { Text, TextClassContext };
