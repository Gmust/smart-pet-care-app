import React from "react";
import type { PressableStateCallbackType, StyleProp, TextStyle } from "react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import type { UnistylesVariants } from "react-native-unistyles";
import { StyleSheet } from "react-native-unistyles";

import { Text, TextClassContext } from "./text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "text";

const buttonVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  function getColors(variant: ButtonVariant, pressed: boolean, disabled: boolean, dotted: boolean) {
    if (disabled) {
      const hasOutline = variant === "ghost";
      return {
        bg: hasOutline || variant === "text" ? theme.palette.transparent : brand.surfaceBorder,
        borderColor: hasOutline ? brand.surfaceBorder : theme.palette.transparent,
        borderStyle: "solid" as const,
        borderWidth: hasOutline ? theme.spacing(0.375) : theme.spacing(0),
        textColor: brand.textFaint,
      };
    }

    if (dotted && variant === "ghost") {
      return {
        bg: theme.palette.transparent,
        borderColor: brand.textSecondary,
        borderStyle: "dashed" as const,
        borderWidth: theme.spacing(0.375),
        textColor: brand.textSecondary,
      };
    }

    switch (variant) {
      case "primary":
        return {
          bg: pressed ? brand.primaryDark : brand.primaryDefault,
          borderColor: theme.palette.transparent,
          borderStyle: "solid" as const,
          borderWidth: theme.spacing(0),
          textColor: pressed ? brand.primarySoft : brand.textOnDark,
        };
      case "secondary":
        return {
          bg: pressed ? brand.ok : brand.primarySoft,
          borderColor: theme.palette.transparent,
          borderStyle: "solid" as const,
          borderWidth: theme.spacing(0),
          textColor: pressed ? brand.textOnDark : brand.primaryDark,
        };
      case "ghost":
        return {
          bg: pressed ? brand.primarySoft : theme.palette.transparent,
          borderColor: brand.primaryDefault,
          borderStyle: "solid" as const,
          borderWidth: theme.spacing(0.375),
          textColor: pressed ? brand.primaryDark : brand.primaryDefault,
        };
      case "danger":
        return {
          bg: pressed ? brand.danger : brand.dangerBg,
          borderColor: theme.palette.transparent,
          borderStyle: "solid" as const,
          borderWidth: theme.spacing(0),
          textColor: pressed ? brand.textOnDark : brand.danger,
        };
      case "text":
      default:
        return {
          bg: theme.palette.transparent,
          borderColor: theme.palette.transparent,
          borderStyle: "solid" as const,
          borderWidth: theme.spacing(0),
          textColor: pressed ? brand.primaryDark : brand.primaryDefault,
        };
    }
  }

  return {
    button: (
      variant: ButtonVariant = "primary",
      pressed: boolean = false,
      disabled: boolean = false,
      isLoading: boolean = false,
      dotted: boolean = false
    ) => {
      const colors = getColors(variant, pressed, disabled || isLoading, dotted);
      return {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing(2),
        borderRadius: theme.borderRadius.lg,
        backgroundColor: colors.bg,
        borderColor: colors.borderColor,
        borderStyle: colors.borderStyle,
        borderWidth: colors.borderWidth,
        variants: {
          size: {
            sm: { paddingHorizontal: theme.spacing(4), height: theme.spacing(10) },
            md: { paddingHorizontal: theme.spacing(5), height: theme.spacing(13.5) },
            lg: { paddingHorizontal: theme.spacing(6), height: theme.spacing(15) },
          },
        },
      };
    },

    text: (
      variant: ButtonVariant = "primary",
      pressed: boolean = false,
      disabled: boolean = false,
      dotted: boolean = false
    ) => {
      const colors = getColors(variant, pressed, disabled, dotted);
      return {
        fontFamily: theme.fonts.semiBold,
        color: colors.textColor,
        variants: {
          size: {
            sm: { fontSize: theme.fontSize.sm },
            md: { fontSize: theme.fontSize.base },
            lg: { fontSize: theme.fontSize.lg },
          },
        },
      };
    },

    iconColor: (
      variant: ButtonVariant = "primary",
      pressed: boolean = false,
      disabled: boolean = false,
      dotted: boolean = false
    ) => ({
      color: getColors(variant, pressed, disabled, dotted).textColor,
    }),
  };
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  UnistylesVariants<typeof buttonVariants> & {
    variant?: ButtonVariant;
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
  buttonVariants.useVariants({ size });

  const isDisabled = disabled || isLoading;

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
    <TextClassContext.Provider
      value={buttonVariants.text(variant, false, isDisabled ?? false, dotted)}
    >
      <Pressable
        {...props}
        onPress={onPress}
        disabled={isDisabled}
        ref={ref}
        role="button"
        style={(state) => [
          buttonVariants.button(variant, state.pressed, isDisabled ?? false, isLoading, dotted),
          typeof style === "function" ? style(state) : style,
        ]}
      >
        {(state) => {
          const resolvedTextStyle = [
            buttonVariants.text(variant, state.pressed, isDisabled ?? false, dotted),
            textStyle,
          ];
          const iconColor = buttonVariants.iconColor(
            variant,
            state.pressed,
            isDisabled ?? false,
            dotted
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
