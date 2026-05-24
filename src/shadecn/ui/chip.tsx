import { Pressable, Text } from "react-native";
import type { UnistylesVariants } from "react-native-unistyles";
import { StyleSheet } from "react-native-unistyles";

export type ChipTone = "neutral" | "primary" | "ok" | "peach" | "warn" | "danger";
export type ChipVariant = "default" | "ghost";

const chipVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  function getTokens(variant: ChipVariant, tone: ChipTone) {
    if (variant === "ghost") {
      switch (tone) {
        case "primary":
          return {
            bg: theme.palette.transparent,
            borderColor: brand.primaryDark,
            textColor: brand.primaryDefault,
          };
        case "ok":
          return {
            bg: theme.palette.transparent,
            borderColor: brand.primaryDefault,
            textColor: brand.ok,
          };
        case "peach":
          return {
            bg: theme.palette.transparent,
            borderColor: brand.peachDefault,
            textColor: brand.peachDefault,
          };
        case "warn":
          return { bg: theme.palette.transparent, borderColor: brand.warn, textColor: brand.warn };
        case "danger":
          return {
            bg: theme.palette.transparent,
            borderColor: brand.danger,
            textColor: brand.danger,
          };
        case "neutral":
        default:
          return {
            bg: theme.palette.transparent,
            borderColor: brand.surfaceBorder,
            textColor: brand.textSecondary,
          };
      }
    }

    switch (tone) {
      case "primary":
        return {
          bg: brand.primarySoft,
          borderColor: theme.palette.transparent,
          textColor: brand.primaryDark,
        };
      case "ok":
        return {
          bg: brand.primarySoft,
          borderColor: theme.palette.transparent,
          textColor: brand.ok,
        };
      case "peach":
        return {
          bg: brand.peachSoft,
          borderColor: theme.palette.transparent,
          textColor: brand.peachDefault,
        };
      case "warn":
        return {
          bg: brand.peachSoft,
          borderColor: theme.palette.transparent,
          textColor: brand.warn,
        };
      case "danger":
        return {
          bg: brand.dangerBg,
          borderColor: theme.palette.transparent,
          textColor: brand.danger,
        };
      case "neutral":
      default:
        return {
          bg: brand.surfaceSunken,
          borderColor: theme.palette.transparent,
          textColor: brand.textPrimary,
        };
    }
  }

  return {
    root: (variant: ChipVariant, tone: ChipTone, pressed: boolean) => {
      const tokens = getTokens(variant, tone);
      return {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        borderRadius: theme.borderRadius.full,
        borderWidth: theme.spacing(0.25),
        borderStyle: "solid",
        borderColor: tokens.borderColor,
        backgroundColor: tokens.bg,
        opacity: pressed ? 0.75 : 1,
        variants: {
          size: {
            md: { paddingHorizontal: theme.spacing(2.75), paddingVertical: theme.spacing(1.25) },
            sm: { paddingHorizontal: theme.spacing(2.25), paddingVertical: theme.spacing(0.75) },
          },
        },
      };
    },

    label: (variant: ChipVariant, tone: ChipTone) => {
      const tokens = getTokens(variant, tone);
      return {
        color: tokens.textColor,
        variants: {
          size: {
            md: { fontFamily: theme.fonts.semiBold, fontSize: theme.fontSize.sm },
            sm: { fontFamily: theme.fonts.medium, fontSize: theme.fontSize.xs },
          },
        },
      };
    },
  };
});

type ChipProps = {
  label: string;
  tone?: ChipTone;
  variant?: ChipVariant;
  onPress?: () => void;
  disabled?: boolean;
} & UnistylesVariants<typeof chipVariants>;

export function Chip({
  label,
  tone = "neutral",
  variant = "default",
  size = "md",
  onPress,
  disabled = false,
}: ChipProps) {
  chipVariants.useVariants({ size });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => chipVariants.root(variant, tone, pressed && !disabled)}
    >
      <Text style={chipVariants.label(variant, tone)}>{label}</Text>
    </Pressable>
  );
}

export { chipVariants };
