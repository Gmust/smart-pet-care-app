import { useState } from "react";
import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { TextInput, View } from "react-native";
import type { UnistylesVariants } from "react-native-unistyles";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import "@/styles/config";
import { Text } from "./text";

const inputVariants = StyleSheet.create((theme) => ({
  wrapper: {
    gap: theme.spacing(1),
  },
  label: (error: boolean = false) => ({
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: error ? theme.palette.brand.danger : theme.palette.brand.textSecondary,
  }),
  root: (
    focused: boolean = false,
    error: boolean = false,
    disabled: boolean = false,
    hasValue: boolean = false
  ) => ({
    flexDirection: "row",
    alignItems: "center",
    borderWidth: theme.spacing(0.375),
    borderStyle: "solid",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing(3.5),
    minHeight: theme.spacing(13),
    backgroundColor: error
      ? theme.palette.brand.dangerBg
      : disabled
        ? theme.palette.brand.surfaceSunken
        : focused || hasValue
          ? theme.palette.white
          : theme.palette.brand.surfacePage,
    borderColor: error
      ? theme.palette.brand.danger
      : focused
        ? theme.palette.brand.primaryDefault
        : theme.palette.brand.surfaceBorder,
    opacity: disabled ? 0.5 : 1,
    variants: {
      size: {
        sm: { minHeight: theme.spacing(10), paddingHorizontal: theme.spacing(3) },
        md: { minHeight: theme.spacing(13), paddingHorizontal: theme.spacing(3.5) },
        lg: { minHeight: theme.spacing(15), paddingHorizontal: theme.spacing(4) },
      },
    },
  }),
  input: (multiline: boolean = false) => ({
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textPrimary,
    paddingVertical: theme.spacing(3),
    textAlignVertical: multiline ? "top" : "center",
  }),
  helperText: (error: boolean = false) => ({
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: error ? theme.palette.brand.danger : theme.palette.brand.textFaint,
  }),
  slot: {
    justifyContent: "center",
    alignItems: "center",
  },
}));

type InputProps = Omit<TextInputProps, "size"> &
  UnistylesVariants<typeof inputVariants> & {
    showStatusIcon?: boolean;
    showClearButton?: boolean;
    onClear?: () => void;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    label?: ReactNode;
    helperText?: ReactNode;
    error?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
  };

function Input({
  size,
  label,
  helperText,
  error = false,
  editable = true,
  multiline = false,
  value,
  onFocus,
  onBlur,
  containerStyle,
  inputStyle,
  leftSlot,
  rightSlot,
  placeholderTextColor,
  ...props
}: InputProps) {
  inputVariants.useVariants({ size });
  const { theme } = useUnistyles();

  const [focused, setFocused] = useState(false);

  const disabled = editable === false;
  const hasValue = value != null && value.length > 0;

  return (
    <View style={inputVariants.wrapper}>
      {label != null ? <Text style={inputVariants.label(error)}>{label}</Text> : null}

      <View style={[inputVariants.root(focused, error, disabled, hasValue), containerStyle]}>
        {leftSlot ? <View style={inputVariants.slot}>{leftSlot}</View> : null}
        <TextInput
          {...props}
          value={value}
          editable={editable}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={placeholderTextColor ?? theme.palette.brand.textFaint}
          selectionColor={theme.palette.brand.primaryDefault}
          style={[inputVariants.input(multiline), inputStyle]}
        />
        {rightSlot ? <View style={inputVariants.slot}>{rightSlot}</View> : null}
      </View>

      {helperText != null ? (
        <Text style={inputVariants.helperText(error)}>{helperText}</Text>
      ) : null}
    </View>
  );
}

export { Input, inputVariants };
