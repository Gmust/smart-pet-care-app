import React from "react";
import type { PressableStateCallbackType, StyleProp, TextStyle } from "react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, { type CSSTransitionProperties } from "react-native-reanimated";
import type { UnistylesVariants } from "react-native-unistyles";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DashedBorder } from "./dashed-border";
import { Text, TextClassContext } from "./text";

export type ButtonVariant =
  | "primary"
  | "tonal"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerText"
  | "text"
  | "link"
  | "icon"
  | "iconOnPhoto";
export type ButtonSize = "sm" | "md" | "icon" | "hug" | "inline";

// In `spacing` units; the touch-target padding below reads it too.
const SM_HEIGHT = 10;

const COLOR_TRANSITION_MS = 200;
const TEXT_TRANSITION: CSSTransitionProperties = {
  transitionProperty: "color",
  transitionDuration: COLOR_TRANSITION_MS,
};

const buttonVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  return {
    button: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(2.5),
      borderRadius: theme.borderRadius.lg,
      variants: {
        variant: {
          primary: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.primaryDark
                : brand.primaryDefault,
            borderWidth: 0,
          },
          tonal: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.primaryMid
                : brand.primarySoft,
            borderWidth: 0,
          },
          ghost: {
            backgroundColor: disabled
              ? dotted
                ? theme.palette.transparent
                : brand.surfaceBorder
              : pressed
                ? dotted
                  ? brand.surfaceSunken
                  : brand.primaryXsoft
                : theme.palette.transparent,
            // The dashed look is drawn by DashedBorder, not by a native border.
            borderWidth: dotted ? 0 : theme.spacing(0.25),
            borderColor: disabled ? brand.textFaint : brand.primaryDefault,
          },
          danger: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.dangerBgMid
                : brand.dangerBg,
            borderWidth: 0,
          },
          dangerText: {
            backgroundColor: theme.palette.transparent,
            borderWidth: 0,
          },
          secondary: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.surfaceSunken
                : theme.palette.white,
            borderWidth: theme.spacing(0.25),
            borderColor: brand.surfaceBorder,
          },
          text: {
            backgroundColor: theme.palette.transparent,
            borderWidth: 0,
          },
          link: {
            backgroundColor: theme.palette.transparent,
            borderWidth: 0,
          },
          icon: {
            backgroundColor: pressed && !disabled ? brand.surfaceSunken : theme.palette.white,
            borderWidth: 1,
            borderColor: brand.surfaceBorder,
          },
          iconOnPhoto: {
            backgroundColor: pressed ? `${brand.peachDefault}b3` : `${brand.peachDefault}80`,
            borderWidth: 1,
            borderColor: brand.peachDefault,
          },
        },
        size: {
          sm: { paddingHorizontal: theme.spacing(4), height: theme.spacing(SM_HEIGHT) },
          md: { paddingHorizontal: theme.spacing(5), height: theme.spacing(13.5) },
          icon: {
            width: theme.spacing(9),
            height: theme.spacing(9),
            paddingHorizontal: 0,
            borderRadius: theme.borderRadius.full,
          },
          hug: { paddingHorizontal: 0 },
          inline: { paddingHorizontal: 0 },
        },
      },
    }),

    text: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      variants: {
        variant: {
          primary: {
            color: disabled ? brand.textSecondary : brand.textOnDark,
          },
          tonal: {
            color: disabled ? brand.textSecondary : brand.primaryDark,
          },
          ghost: {
            color: disabled
              ? brand.textFaint
              : dotted
                ? brand.textSecondary
                : pressed
                  ? brand.primaryDark
                  : brand.primaryDefault,
          },
          danger: { color: disabled ? brand.textSecondary : brand.danger },
          dangerText: {
            color: disabled ? brand.textFaint : pressed ? brand.dangerDark : brand.danger,
          },
          secondary: { color: disabled ? brand.textSecondary : brand.textPrimary },
          text: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
          },
          link: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
            textDecorationLine: "underline",
          },
          icon: {
            color: disabled ? brand.textFaint : brand.textPrimary,
          },
          iconOnPhoto: {
            color: brand.peachIconBg,
          },
        },
        size: {
          sm: { ...theme.textStyles.bodySemiBold },
          md: { ...theme.textStyles.controlL },
          icon: { ...theme.textStyles.controlL },
          hug: {},
          inline: { ...theme.textStyles.bodySemiBold },
        },
      },
    }),

    animatedShell: {
      backgroundColor: theme.palette.transparent,
      overflow: "hidden",
    },
    fillLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: theme.borderRadius.lg,
    },

    iconColor: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      variants: {
        variant: {
          primary: {
            color: disabled ? brand.textSecondary : brand.textOnDark,
          },
          tonal: {
            color: disabled ? brand.textSecondary : brand.primaryDark,
          },
          ghost: {
            color: disabled
              ? brand.textFaint
              : dotted
                ? brand.textSecondary
                : pressed
                  ? brand.primaryDark
                  : brand.primaryDefault,
          },
          danger: { color: disabled ? brand.textSecondary : brand.danger },
          dangerText: {
            color: disabled ? brand.textFaint : pressed ? brand.dangerDark : brand.danger,
          },
          secondary: { color: disabled ? brand.textSecondary : brand.textPrimary },
          text: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
          },
          link: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
          },
          icon: {
            color: disabled ? brand.textFaint : brand.textPrimary,
          },
          iconOnPhoto: {
            color: brand.peachIconBg,
          },
        },
      },
    }),
  };
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  UnistylesVariants<typeof buttonVariants> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    textStyle?: StyleProp<TextStyle>;
    isLoading?: boolean;
    dotted?: boolean;
    animateDisabled?: boolean;
  };

function Button({
  ref,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  onPress,
  style,
  disabled,
  textStyle,
  isLoading = false,
  dotted = false,
  animateDisabled = false,
  hitSlop,
  ...props
}: ButtonProps) {
  buttonVariants.useVariants({ size, variant });
  const { theme } = useUnistyles();

  const isDisabled = !!(disabled || isLoading);

  const renderChildren = (
    state: PressableStateCallbackType,
    resolvedTextStyle: StyleProp<TextStyle>
  ) => {
    if (!props.children) return null;

    if (typeof props.children === "function") {
      return props.children(state);
    }

    return React.Children.map(props.children, (child) => {
      if (typeof child === "string") {
        return animateDisabled ? (
          <Animated.Text
            // Reanimated types an array style as plain text style, which has no room for the CSS
            // transition keys it reads at runtime.
            style={[resolvedTextStyle, TEXT_TRANSITION] as StyleProp<TextStyle>}
          >
            {child}
          </Animated.Text>
        ) : (
          <Text style={resolvedTextStyle}>{child}</Text>
        );
      }
      return child;
    });
  };

  return (
    <TextClassContext.Provider value={buttonVariants.text(isDisabled, false, dotted)}>
      <Pressable
        {...props}
        onPress={onPress}
        disabled={isDisabled}
        ref={ref}
        role="button"
        hitSlop={
          hitSlop ??
          (size === "icon"
            ? 6
            : size === "inline"
              ? (theme.minTouchTarget - theme.textStyles.bodySemiBold.lineHeight) / 2
              : size === "sm"
                ? (theme.minTouchTarget - theme.spacing(SM_HEIGHT)) / 2
                : undefined)
        }
        style={(state) => [
          buttonVariants.button(isDisabled, state.pressed, dotted),
          animateDisabled && buttonVariants.animatedShell,
          typeof style === "function" ? style(state) : style,
        ]}
      >
        {(state) => {
          const resolvedTextStyle = [
            buttonVariants.text(isDisabled, state.pressed, dotted),
            textStyle,
          ];
          const iconColor = (
            buttonVariants.iconColor(isDisabled, state.pressed, dotted) as { color: string }
          ).color;
          return (
            <>
              {animateDisabled ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    buttonVariants.fillLayer,
                    {
                      // Unistyles returns the resolved style object; only its fill is read here.
                      backgroundColor: (
                        buttonVariants.button(isDisabled, state.pressed, dotted) as {
                          backgroundColor: string;
                        }
                      ).backgroundColor,
                      transitionProperty: "backgroundColor",
                      transitionDuration: COLOR_TRANSITION_MS,
                    },
                  ]}
                />
              ) : null}
              {variant === "ghost" && dotted ? (
                <DashedBorder
                  color={
                    isDisabled ? theme.palette.brand.textFaint : theme.palette.brand.textSecondary
                  }
                  radius={theme.borderRadius.lg}
                />
              ) : null}
              {!!icon && iconPosition === "left" && !isLoading && <View>{icon}</View>}
              {isLoading ? (
                <ActivityIndicator size="small" color={iconColor} />
              ) : (
                renderChildren(state, resolvedTextStyle)
              )}
              {!!icon && iconPosition === "right" && !isLoading && <View>{icon}</View>}
            </>
          );
        }}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonVariants };
