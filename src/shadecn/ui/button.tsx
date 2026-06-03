import React from "react";
import type { PressableStateCallbackType, StyleProp, TextStyle } from "react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import type { UnistylesVariants } from "react-native-unistyles";
import { StyleSheet } from "react-native-unistyles";

import "@/styles/config";
import { Text, TextClassContext } from "./text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "text" | "icon";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  return {
    button: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(2),
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
          secondary: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.ok
                : brand.primarySoft,
            borderWidth: 0,
          },
          ghost: {
            backgroundColor: pressed && !disabled ? brand.primarySoft : theme.palette.transparent,
            borderWidth: theme.spacing(0.375),
            borderStyle: dotted ? "dashed" : "solid",
            borderColor: disabled
              ? brand.surfaceBorder
              : dotted
                ? brand.textSecondary
                : brand.primaryDefault,
          },
          danger: {
            backgroundColor: disabled
              ? brand.surfaceBorder
              : pressed
                ? brand.danger
                : brand.dangerBg,
            borderWidth: 0,
          },
          text: {
            backgroundColor: theme.palette.transparent,
            borderWidth: 0,
          },
          icon: {
            backgroundColor: pressed && !disabled ? brand.surfaceSunken : theme.palette.white,
            borderWidth: 1,
            borderColor: disabled ? brand.surfaceBorder : brand.surfaceBorder,
          },
        },
        size: {
          sm: { paddingHorizontal: theme.spacing(4), height: theme.spacing(10) },
          md: { paddingHorizontal: theme.spacing(5), height: theme.spacing(13.5) },
          lg: { paddingHorizontal: theme.spacing(6), height: theme.spacing(15) },
          icon: {
            width: theme.spacing(9),
            height: theme.spacing(9),
            paddingHorizontal: 0,
            borderRadius: theme.borderRadius.full,
          },
        },
      },
    }),

    text: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      fontFamily: theme.fonts.semiBold,
      variants: {
        variant: {
          primary: {
            color: disabled ? brand.textFaint : pressed ? brand.primarySoft : brand.textOnDark,
          },
          secondary: {
            color: disabled ? brand.textFaint : pressed ? brand.textOnDark : brand.primaryDark,
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
          danger: { color: disabled ? brand.textFaint : pressed ? brand.textOnDark : brand.danger },
          text: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
          },
          icon: {
            color: disabled ? brand.textFaint : brand.textPrimary,
          },
        },
        size: {
          sm: { fontSize: theme.fontSize.sm },
          md: { fontSize: theme.fontSize.base },
          lg: { fontSize: theme.fontSize.lg },
          icon: { fontSize: theme.fontSize.base },
        },
      },
    }),

    iconColor: (disabled: boolean = false, pressed: boolean = false, dotted: boolean = false) => ({
      variants: {
        variant: {
          primary: {
            color: disabled ? brand.textFaint : pressed ? brand.primarySoft : brand.textOnDark,
          },
          secondary: {
            color: disabled ? brand.textFaint : pressed ? brand.textOnDark : brand.primaryDark,
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
          danger: { color: disabled ? brand.textFaint : pressed ? brand.textOnDark : brand.danger },
          text: {
            color: disabled ? brand.textFaint : pressed ? brand.primaryDark : brand.primaryDefault,
          },
          icon: {
            color: disabled ? brand.textFaint : brand.textPrimary,
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
  ...props
}: ButtonProps) {
  buttonVariants.useVariants({ size, variant });

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
        return <Text style={resolvedTextStyle}>{child}</Text>;
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
        style={(state) => [
          buttonVariants.button(isDisabled, state.pressed, dotted),
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
