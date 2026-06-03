import React, { createContext, useContext, useMemo, useState } from "react";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as SelectPrimitive from "@rn-primitives/select";

import { Chevron } from "@/icons/arrows";

import "@/styles/config";
import { Text } from "./text";

type Option = SelectPrimitive.Option;

const SelectWidthContext = createContext<{
  width: number;
  setWidth: (w: number) => void;
}>({ width: 0, setWidth: () => {} });

function Select({ children, ...props }: SelectPrimitive.RootProps) {
  const [width, setWidth] = useState(0);
  const contextValue = useMemo(() => ({ width, setWidth }), [width]);

  return (
    <SelectWidthContext.Provider value={contextValue}>
      <View style={{ alignSelf: "flex-start" }}>
        <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
      </View>
    </SelectWidthContext.Provider>
  );
}

const SelectPortal = SelectPrimitive.Portal;
const SelectGroup = SelectPrimitive.Group;

function SelectTrigger({
  style,
  children,
  ...props
}: SelectPrimitive.TriggerProps & {
  ref?: React.RefObject<SelectPrimitive.TriggerRef>;
  style?: StyleProp<ViewStyle>;
}) {
  const { setWidth } = useContext(SelectWidthContext);
  const { theme } = useUnistyles();
  const triggerChildren = typeof children === "function" ? null : children;

  return (
    <SelectPrimitive.Trigger
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={(state) => [
        styles.trigger,
        state.pressed && styles.triggerPressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {triggerChildren}
      <Chevron color={theme.palette.brand.textPrimary} style={styles.chevron} />
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = SelectPrimitive.useRootContext();
  return (
    <Text style={value ? styles.valueText : styles.valuePlaceholder}>
      {value?.label ?? placeholder}
    </Text>
  );
}

const overlayEntering = FadeIn.duration(150);
const overlayExiting = FadeOut.duration(120);

function SelectContent({
  children,
  style,
  ...props
}: SelectPrimitive.ContentProps & {
  ref?: React.RefObject<SelectPrimitive.ContentRef>;
}) {
  const { width } = useContext(SelectWidthContext);
  const contentStyle = typeof style === "function" ? undefined : style;
  const mergedContentStyle = [
    styles.content,
    width > 0 ? { width } : undefined,
    contentStyle,
  ].filter(Boolean) as unknown as ViewStyle;

  return (
    <SelectPortal>
      <SelectPrimitive.Overlay style={StyleSheet.absoluteFill}>
        <Animated.View entering={overlayEntering} exiting={overlayExiting}>
          <SelectPrimitive.Content style={mergedContentStyle} {...props}>
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </Animated.View>
      </SelectPrimitive.Overlay>
    </SelectPortal>
  );
}

function SelectLabel({
  style,
  ...props
}: SelectPrimitive.LabelProps & {
  ref?: React.RefObject<SelectPrimitive.LabelRef>;
}) {
  return <SelectPrimitive.Label style={[styles.label, style]} {...props} />;
}

function SelectItem({
  style,
  children,
  ...props
}: SelectPrimitive.ItemProps & {
  ref?: React.RefObject<SelectPrimitive.ItemRef>;
}) {
  const itemChildren = typeof children === "function" ? null : children;

  return (
    <SelectPrimitive.Item
      style={(state) => [
        styles.item,
        state.pressed && styles.itemPressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <SelectPrimitive.ItemText style={styles.itemText} />
      {itemChildren}
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  style,
  ...props
}: SelectPrimitive.SeparatorProps & {
  ref?: React.RefObject<SelectPrimitive.SeparatorRef>;
}) {
  return <SelectPrimitive.Separator style={[styles.separator, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: theme.spacing(2.5),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    paddingVertical: theme.spacing(1.5),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(3.5),
    minHeight: theme.spacing(11),
  },
  triggerPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  chevron: {
    transform: [{ rotate: "-90deg" }],
  },
  valueText: {
    flexShrink: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  valuePlaceholder: {
    flexShrink: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textFaint,
  },
  content: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius["2xl"],
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    overflow: "hidden",
    boxShadow: "0px 4px 10px 0 rgba(0,0,0,0.12)",
    paddingVertical: theme.spacing(1),
  },
  label: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    gap: theme.spacing(3),
  },
  itemPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  itemText: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.palette.brand.surfaceBorder,
    marginVertical: theme.spacing(1),
  },
}));

export type { Option };
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
