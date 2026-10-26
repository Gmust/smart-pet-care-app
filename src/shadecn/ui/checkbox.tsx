import type { PressableProps } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { CheckIcon } from "@/icons/check";

export type CheckboxShape = "square" | "circle";

type CheckboxProps = Omit<PressableProps, "children" | "onPress"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  shape?: CheckboxShape;
};

export function Checkbox({
  checked,
  onCheckedChange,
  shape = "square",
  disabled,
  style,
  hitSlop,
  ...props
}: CheckboxProps) {
  const { theme } = useUnistyles();
  const { brand } = theme.palette;

  const looks = {
    square: {
      size: theme.spacing(6),
      radius: theme.borderRadius.md,
      off: { fill: theme.palette.white, border: brand.textSecondary, check: undefined },
      on: { fill: brand.primaryDefault, border: undefined, check: brand.textOnDark },
    },
    circle: {
      size: theme.spacing(7),
      radius: theme.borderRadius.full,
      off: {
        fill: theme.palette.transparent,
        border: brand.surfaceBorder,
        check: brand.surfaceBorder,
      },
      on: { fill: brand.primarySoft, border: undefined, check: brand.primaryDark },
    },
  };
  const { size, radius, off, on } = looks[shape];
  const state = checked ? on : off;
  const checkSize = checked ? theme.iconSize.md : theme.iconSize.lg;

  return (
    <Pressable
      {...props}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      hitSlop={hitSlop ?? (theme.minTouchTarget - size) / 2}
      onPress={() => onCheckedChange(!checked)}
      style={(pressState) => [
        styles.root(size, radius, state.fill, state.border, !!disabled),
        typeof style === "function" ? style(pressState) : style,
      ]}
    >
      {state.check ? <CheckIcon width={checkSize} height={checkSize} color={state.check} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: (
    size: number,
    radius: number,
    fill: string,
    border: string | undefined,
    disabled: boolean
  ) => ({
    width: size,
    height: size,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
    borderWidth: border ? theme.spacing(0.375) : 0,
    borderColor: border,
    backgroundColor: fill,
    opacity: disabled ? 0.5 : 1,
  }),
}));
