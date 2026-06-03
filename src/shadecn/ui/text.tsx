import * as React from "react";
import type { TextStyle } from "react-native";
import { Text as RNText } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import * as Slot from "@rn-primitives/slot";

import "@/styles/config";

const TextClassContext = React.createContext<TextStyle | undefined>(undefined);

type TextProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
};

function Text({ style, asChild = false, ...props }: TextProps) {
  const contextStyles = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;

  return <Component style={[styles.textBase, contextStyles, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  textBase: { color: theme.palette.black },
}));

export { Text, TextClassContext };
