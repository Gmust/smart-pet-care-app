import type { ComponentType } from "react";
import { Pressable, Text } from "react-native";
import type { SvgProps } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { theme } from "@/styles/theme";

export type ChipTone = "neutral" | "primary" | "ok" | "peach" | "warn" | "danger";
export type ChipVariant = "default" | "ghost";
type ChipToneKey = ChipTone | `ghost-${ChipTone}`;
type ChipSize = "md" | "sm";

type AppTheme = typeof theme;

const getToneColors = (theme: AppTheme) => {
  const { brand } = theme.palette;

  return {
    neutral: brand.textPrimary,
    primary: brand.primaryDark,
    ok: brand.ok,
    peach: brand.peachDefault,
    warn: brand.warn,
    danger: brand.danger,
    "ghost-neutral": brand.textSecondary,
    "ghost-primary": brand.primaryDefault,
    "ghost-ok": brand.ok,
    "ghost-peach": brand.peachDefault,
    "ghost-warn": brand.warn,
    "ghost-danger": brand.danger,
  } satisfies Record<ChipToneKey, string>;
};

const chipVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;
  const toneColors = getToneColors(theme);

  return {
    root: (pressed: boolean = false, disabled: boolean = false) => ({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
      borderRadius: theme.borderRadius.full,
      borderWidth: theme.spacing(0.25),
      borderStyle: "solid",
      opacity: pressed && !disabled ? 0.75 : 1,
      variants: {
        tone: {
          neutral: { backgroundColor: brand.surfaceSunken, borderColor: theme.palette.transparent },
          primary: { backgroundColor: brand.primarySoft, borderColor: theme.palette.transparent },
          ok: { backgroundColor: brand.primarySoft, borderColor: theme.palette.transparent },
          peach: { backgroundColor: brand.peachSoft, borderColor: theme.palette.transparent },
          warn: { backgroundColor: brand.peachSoft, borderColor: theme.palette.transparent },
          danger: { backgroundColor: brand.dangerBg, borderColor: theme.palette.transparent },
          "ghost-neutral": {
            backgroundColor: theme.palette.transparent,
            borderColor: brand.surfaceBorder,
          },
          "ghost-primary": {
            backgroundColor: theme.palette.transparent,
            borderColor: brand.primaryDark,
          },
          "ghost-ok": {
            backgroundColor: theme.palette.transparent,
            borderColor: brand.primaryDefault,
          },
          "ghost-peach": {
            backgroundColor: theme.palette.transparent,
            borderColor: brand.peachDefault,
          },
          "ghost-warn": { backgroundColor: theme.palette.transparent, borderColor: brand.warn },
          "ghost-danger": { backgroundColor: theme.palette.transparent, borderColor: brand.danger },
        },
        size: {
          md: {
            paddingHorizontal: theme.spacing(2.75),
            paddingVertical: theme.spacing(1.25),
            gap: theme.spacing(1),
          },
          sm: {
            paddingHorizontal: theme.spacing(2.25),
            paddingVertical: theme.spacing(0.75),
            gap: theme.spacing(1),
          },
        },
      },
    }),

    label: {
      variants: {
        tone: {
          neutral: { color: toneColors.neutral },
          primary: { color: toneColors.primary },
          ok: { color: toneColors.ok },
          peach: { color: toneColors.peach },
          warn: { color: toneColors.warn },
          danger: { color: toneColors.danger },
          "ghost-neutral": { color: toneColors["ghost-neutral"] },
          "ghost-primary": { color: toneColors["ghost-primary"] },
          "ghost-ok": { color: toneColors["ghost-ok"] },
          "ghost-peach": { color: toneColors["ghost-peach"] },
          "ghost-warn": { color: toneColors["ghost-warn"] },
          "ghost-danger": { color: toneColors["ghost-danger"] },
        },
        size: {
          md: { ...theme.textStyles.chipMd },
          sm: { ...theme.textStyles.chipSm },
        },
      },
    },
  };
});

type ChipProps = {
  label: string;
  tone?: ChipTone;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ComponentType<SvgProps>;
  iconSize?: number;
  onPress?: () => void;
  disabled?: boolean;
};

export function Chip({
  label,
  tone = "neutral",
  variant = "default",
  size = "md",
  icon: Icon,
  iconSize,
  onPress,
  disabled = false,
}: ChipProps) {
  const toneKey: ChipToneKey = variant === "ghost" ? `ghost-${tone}` : tone;
  chipVariants.useVariants({ size, tone: toneKey });
  const { theme } = useUnistyles();
  const iconColor = getToneColors(theme)[toneKey];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => chipVariants.root(pressed && !disabled, disabled)}
    >
      {!!Icon && (
        <Icon
          width={iconSize ?? theme.iconSize[size]}
          height={iconSize ?? theme.iconSize[size]}
          color={iconColor}
        />
      )}
      <Text style={chipVariants.label}>{label}</Text>
    </Pressable>
  );
}

export { chipVariants };
