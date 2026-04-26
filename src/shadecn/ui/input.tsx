import React from "react";
import { TextInput, TextStyle, View, ViewStyle } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type InputProps = React.ComponentProps<typeof TextInput> &
  UnistylesVariants<typeof inputVariants> & {
    leftSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
  };

const inputVariants = StyleSheet.create((theme) => ({
  root: (focused: boolean = false, disabled: boolean = false) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderWidth: 1,
    opacity: disabled ? 0.55 : 1,
    variants: {
      variant: {
        default: {
          borderColor: focused ? theme.palette.cyan[500] : theme.palette.slate[200],
          backgroundColor: theme.palette.white,
        },
        filled: {
          borderColor: focused ? theme.palette.cyan[500] : theme.palette.transparent,
          backgroundColor: theme.palette.slate[100],
        },
        ghost: {
          borderColor: focused ? theme.palette.cyan[500] : theme.palette.slate[700],
          backgroundColor: theme.palette.transparent,
        },
      },
      size: {
        sm: {
          minHeight: theme.spacing(11),
          borderRadius: theme.borderRadius.xl,
          paddingHorizontal: theme.spacing(3.5),
        },
        md: {
          minHeight: theme.spacing(13),
          borderRadius: theme.borderRadius["2xl"],
          paddingHorizontal: theme.spacing(4),
        },
        lg: {
          minHeight: theme.spacing(15),
          borderRadius: theme.borderRadius["3xl"],
          paddingHorizontal: theme.spacing(5),
        },
      },
    },
  }),
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: theme.fonts.medium,
    variants: {
      variant: {
        default: {
          color: theme.palette.slate[950],
        },
        filled: {
          color: theme.palette.slate[950],
        },
        ghost: {
          color: theme.palette.white,
        },
      },
      size: {
        sm: {
          fontSize: theme.fontSize.sm,
        },
        md: {
          fontSize: theme.fontSize.base,
        },
        lg: {
          fontSize: theme.fontSize.lg,
        },
      },
    },
  },
  slot: {
    justifyContent: "center",
    alignItems: "center",
  },
}));

function Input({
  variant,
  size,
  editable = true,
  onFocus,
  onBlur,
  containerStyle,
  inputStyle,
  leftSlot,
  rightSlot,
  placeholderTextColor,
  ...props
}: InputProps) {
  inputVariants.useVariants({ variant, size });

  const [focused, setFocused] = React.useState(false);
  const disabled = editable === false;

  return (
    <View style={[inputVariants.root(focused, disabled), containerStyle]}>
      {leftSlot ? <View style={inputVariants.slot}>{leftSlot}</View> : null}
      <TextInput
        {...props}
        editable={editable}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={placeholderTextColor ?? (variant === "ghost" ? "#94a3b8" : "#64748b")}
        selectionColor="#06b6d4"
        style={[inputVariants.input, inputStyle]}
      />
      {rightSlot ? <View style={inputVariants.slot}>{rightSlot}</View> : null}
    </View>
  );
}

export { Input, inputVariants };
