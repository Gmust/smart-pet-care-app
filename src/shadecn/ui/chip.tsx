import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type ChipTone = "neutral" | "primary" | "ok" | "peach" | "warn" | "danger";
export type ChipVariant = "default" | "ghost";
type ChipToneKey = ChipTone | `ghost-${ChipTone}`;
type ChipSize = "md" | "sm";

const chipVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

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
          md: { paddingHorizontal: theme.spacing(2.75), paddingVertical: theme.spacing(1.25) },
          sm: { paddingHorizontal: theme.spacing(2.25), paddingVertical: theme.spacing(0.75) },
        },
      },
    }),

    label: {
      variants: {
        tone: {
          neutral: { color: brand.textPrimary },
          primary: { color: brand.primaryDark },
          ok: { color: brand.ok },
          peach: { color: brand.peachDefault },
          warn: { color: brand.warn },
          danger: { color: brand.danger },
          "ghost-neutral": { color: brand.textSecondary },
          "ghost-primary": { color: brand.primaryDefault },
          "ghost-ok": { color: brand.ok },
          "ghost-peach": { color: brand.peachDefault },
          "ghost-warn": { color: brand.warn },
          "ghost-danger": { color: brand.danger },
        },
        size: {
          md: { fontFamily: theme.fonts.semiBold, fontSize: theme.fontSize.sm },
          sm: { fontFamily: theme.fonts.medium, fontSize: theme.fontSize.xs },
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
  onPress?: () => void;
  disabled?: boolean;
};

export function Chip({
  label,
  tone = "neutral",
  variant = "default",
  size = "md",
  onPress,
  disabled = false,
}: ChipProps) {
  const toneKey: ChipToneKey = variant === "ghost" ? `ghost-${tone}` : tone;
  chipVariants.useVariants({ size, tone: toneKey });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => chipVariants.root(pressed && !disabled, disabled)}
    >
      <Text style={chipVariants.label}>{label}</Text>
    </Pressable>
  );
}

export { chipVariants };
