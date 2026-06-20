import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const overlayEntering = FadeIn.duration(150);
const overlayExiting = FadeOut.duration(120);

function DropdownMenuContent({
  children,
  portalHost = "dropdown",
  align = "end",
  sideOffset = 8,
  style,
  ...props
}: DropdownMenuPrimitive.ContentProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.ContentRef>;
  portalHost?: DropdownMenuPrimitive.PortalProps["hostName"];
  style?: StyleProp<ViewStyle>;
}) {
  // The native primitive renders Content as `style={[positionStyle, style]}`,
  // so a function/array style is dropped. Flatten to a plain object instead.
  const contentStyle = StyleSheet.flatten([styles.content, style]);

  return (
    <DropdownMenuPortal hostName={portalHost}>
      <DropdownMenuPrimitive.Overlay style={StyleSheet.absoluteFill}>
        <Animated.View entering={overlayEntering} exiting={overlayExiting}>
          <DropdownMenuPrimitive.Content
            align={align}
            sideOffset={sideOffset}
            style={contentStyle}
            {...props}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </Animated.View>
      </DropdownMenuPrimitive.Overlay>
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({
  style,
  ...props
}: DropdownMenuPrimitive.ItemProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.ItemRef>;
}) {
  return (
    <DropdownMenuPrimitive.Item
      style={(state) => [
        styles.item,
        state.pressed && styles.itemPressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  style,
  ...props
}: DropdownMenuPrimitive.LabelProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.LabelRef>;
}) {
  return <DropdownMenuPrimitive.Label style={[styles.label, style]} {...props} />;
}

function DropdownMenuSeparator({
  style,
  ...props
}: DropdownMenuPrimitive.SeparatorProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.SeparatorRef>;
  style?: StyleProp<ViewStyle>;
}) {
  return <DropdownMenuPrimitive.Separator style={[styles.separator, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  content: {
    minWidth: theme.spacing(48),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    borderCurve: "continuous",
    backgroundColor: theme.palette.white,
    padding: theme.spacing(1.5),
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
  },
  itemPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  label: {
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: theme.palette.brand.surfaceBorder,
    marginVertical: theme.spacing(1),
  },
}));

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
