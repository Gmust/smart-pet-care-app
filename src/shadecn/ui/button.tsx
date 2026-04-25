import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  View,
} from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

import { Text, TextClassContext } from "./text";

const buttonVariants = StyleSheet.create((theme) => ({
  button: (disabled: boolean = false, pressed: boolean = false, isLoading: boolean = false) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius["2xl"],
    gap: theme.spacing(2),
    opacity: disabled || isLoading ? 0.4 : 1,
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.palette.amber[400],
        },
        secondary: {},
        positive: {},
        negative: {},
        icon: {
          width: theme.spacing(6),
          height: theme.spacing(6),
          backgroundColor: "transparent",
          padding: 0,
          margin: 0,
          opacity: pressed ? 0.7 : 1,
        },
        default: {
          backgroundColor: "transparent",
        },
      },
      size: {
        icon: {
          padding: 0,
        },
        xs: {
          paddingHorizontal: theme.spacing(3.5),
          height: theme.spacing(8),
          borderRadius: theme.borderRadius.full,
        },
        sm: {
          paddingHorizontal: theme.spacing(4),
          height: theme.spacing(12),
          borderRadius: theme.borderRadius.xl,
        },
        sm_md: {
          paddingHorizontal: theme.spacing(4),
          height: theme.spacing(10),
          borderRadius: 14,
        },
        md: {
          paddingHorizontal: theme.spacing(4),
          height: theme.spacing(14),
          borderRadius: theme.borderRadius["2xl"],
        },
        lg: {
          paddingHorizontal: theme.spacing(6),
          height: theme.spacing(11),
        },
        xl: {
          paddingHorizontal: theme.spacing(7),
          height: theme.spacing(12),
        },
      },
    },
  }),
  text: {
    fontFamily: theme.fonts.medium,
    color: theme.palette.white,
    variants: {
      action: {
        primary: {
          color: theme.palette.white,
        },
        secondary: {
          color: theme.palette.white,
        },
        positive: {
          color: theme.palette.white,
        },
        negative: {
          color: theme.palette.white,
        },
        black: {
          color: theme.palette.white,
        },
        icon: {
          color: theme.palette.white,
        },
        default: {
          color: theme.palette.white,
        },
      },
      variant: {
        link: {},
        outline: {},
        solid: {
          color: theme.palette.white,
        },
      },
      size: {
        icon: {
          fontSize: theme.fontSize.sm,
        },
        xs: {
          fontSize: theme.fontSize.xs,
        },
        sm: {
          fontSize: theme.fontSize.sm,
        },
        sm_md: {
          fontSize: theme.fontSize.xs,
        },
        md: {
          fontSize: theme.fontSize.base,
        },
        lg: {
          fontSize: theme.fontSize.lg,
        },
        xl: {
          fontSize: theme.fontSize.xl,
        },
      },
    },
  },
}));

const iconStyles = StyleSheet.create((theme) => ({
  leftIcon: (iconOnly: boolean) => ({
    marginRight: iconOnly ? 0 : theme.spacing(2),
  }),
  rightIcon: (iconOnly: boolean) => ({
    marginLeft: iconOnly ? 0 : theme.spacing(2),
  }),
}));

type ButtonProps = React.ComponentProps<typeof Pressable> &
  UnistylesVariants<typeof buttonVariants> & {
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    textStyle?: StyleProp<TextStyle>;
    isLoading?: boolean;
  };

function Button({
  ref,
  variant,
  size,
  icon,
  iconPosition = "left",
  onPress,
  style,
  disabled,
  textStyle,
  isLoading,
  ...props
}: ButtonProps) {
  buttonVariants.useVariants({ size, variant });

  const iconOnly = !!icon && !props.children;
  const isDisabled = disabled || isLoading;

  const renderChildren = (state: PressableStateCallbackType, textStyle?: StyleProp<TextStyle>) => {
    if (!props.children) return null;

    if (typeof props.children === "function") {
      return props.children(state);
    }

    return React.Children.map(props.children, (child) => {
      if (typeof child === "string") {
        return <Text style={textStyle}>{child}</Text>;
      }
      return child;
    });
  };

  return (
    <TextClassContext.Provider value={buttonVariants.text}>
      <Pressable
        {...props}
        onPress={onPress}
        disabled={isDisabled}
        style={(state) => [
          buttonVariants.button(isDisabled ?? false, state.pressed, isLoading),
          typeof style === "function" ? style(state) : style,
        ]}
        ref={ref}
        role="button"
      >
        {(state) => (
          <>
            {!!icon && iconPosition === "left" && (
              <View style={iconStyles.leftIcon(iconOnly)}>{icon}</View>
            )}
            {renderChildren(state, textStyle)}
            {!!icon && iconPosition === "right" && (
              <View style={iconStyles.rightIcon(iconOnly)}>{icon}</View>
            )}
            {isLoading && <ActivityIndicator />}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonVariants };
