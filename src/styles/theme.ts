import { palette } from "./palette";

const BASE_SPACING = 4;
const BASE_TEXT_SIZE = 16;

// ---------------------------------------------------------------------------
// LEGACY — Tailwind-style rem scale, does not match Figma values exactly.
// Kept temporarily so existing usages across the app keep compiling while we
// migrate screen by screen. Do not use these in new code.
// TODO(remove-legacy-theme-tokens): delete FONT_FAMILY, DISPLAY_FONT_FAMILY,
// getTextSize, theme.fonts (old keys), theme.fontSize (old keys) once
// `graphify query` / grep shows zero remaining references.
// ---------------------------------------------------------------------------
const FONT_FAMILY = "Inter";
const DISPLAY_FONT_FAMILY = "Fraunces_700Bold";
const DISPLAY_REGULAR_FONT_FAMILY = "Fraunces_400Regular";

const getTextSize = (s: number) => s * BASE_TEXT_SIZE;

// ---------------------------------------------------------------------------
// PERMANENT — actual font family names as registered with `useFonts` in
// _layout.tsx (via @expo-google-fonts/inter and @expo-google-fonts/fraunces).
// These strings must match the useFonts() keys exactly, or RN silently falls
// back to the system font instead of erroring.
// ---------------------------------------------------------------------------
const INTER_REGULAR = "Inter_400Regular";
const INTER_MEDIUM = "Inter_500Medium";
const INTER_SEMIBOLD = "Inter_600SemiBold";
const FRAUNCES_REGULAR = "Fraunces_400Regular";
const FRAUNCES_SEMIBOLD = "Fraunces_600SemiBold";

export const theme = {
  palette,
  spacing: (v: number) => v * BASE_SPACING,
  textSizing: getTextSize, // LEGACY — superseded by explicit pixel values in fontSize below
  shadows: {
    dialog: "0px 4px 10px 0 rgba(0,0,0,0.35)",
  },

  // ---------------------------------------------------------------------
  // LEGACY fonts/fontSize — Tailwind-style weight & rem scale.
  // Still used across the app; do not remove until migration is complete.
  // ---------------------------------------------------------------------
  fonts: {
    display: DISPLAY_FONT_FAMILY,
    displayRegular: DISPLAY_REGULAR_FONT_FAMILY,
    thin: FONT_FAMILY,
    extraLight: FONT_FAMILY,
    light: FONT_FAMILY,
    regular: FONT_FAMILY,
    medium: FONT_FAMILY,
    semiBold: FONT_FAMILY,
    bold: FONT_FAMILY,
    extraBold: FONT_FAMILY,
    black: FONT_FAMILY,
  },
  fontSize: {
    xs: getTextSize(0.75),
    sm: getTextSize(0.875),
    base: getTextSize(1),
    lg: getTextSize(1.125),
    xl: getTextSize(1.25),
    "2xl": getTextSize(1.5),
    "3xl": getTextSize(1.875),
    "4xl": getTextSize(2.25),
    "5xl": getTextSize(3),
    "6xl": getTextSize(3.75),
    "7xl": getTextSize(4.5),
    "8xl": getTextSize(6),
    "9xl": getTextSize(8),
  },

  // ---------------------------------------------------------------------
  // PERMANENT — new tokens, sourced directly from the Figma "Styles" panel.
  // Use these for all new work and when migrating existing screens.
  // ---------------------------------------------------------------------

  // Raw font family primitives, exposed in case a component needs the family
  // without a full textStyle (e.g. combining with a custom size).
  fontFamily: {
    display: FRAUNCES_SEMIBOLD,
    displayRegular: FRAUNCES_REGULAR,
    regular: INTER_REGULAR,
    medium: INTER_MEDIUM,
    semiBold: INTER_SEMIBOLD,
  },

  // Raw pixel sizes actually used in the Figma file
  fontPx: {
    "10": 10,
    "11": 11,
    "12": 12,
    "13": 13,
    "14": 14,
    "15": 15,
    "19": 19,
    "24": 24,
    "32": 32,
  },

  // Semantic text styles — mirror the named "Text styles" list in the Figma
  // Styles panel 1:1 (Display, Body, Label, Caption, Title/L, Title/M,
  // Body/S, Body/SemiBold, Chip/md, Chip/sm, TabLabel/active, TabLabel/inactive).
  // Prefer these over composing fontFamily + fontPx + lineHeight by hand in
  // every component — that's the duplication we're trying to get rid of.
  textStyles: {
    display: {
      fontFamily: FRAUNCES_SEMIBOLD,
      fontSize: 32,
      lineHeight: 32 * 1.2,
    },
    titleL: {
      fontFamily: FRAUNCES_REGULAR,
      fontSize: 24,
      lineHeight: 24 * 1.2,
    },
    titleM: {
      fontFamily: FRAUNCES_REGULAR,
      fontSize: 19,
      lineHeight: 19 * 1.2,
    },
    body: {
      fontFamily: INTER_REGULAR,
      fontSize: 15,
      lineHeight: 15 * 1.4,
    },
    bodyS: {
      fontFamily: INTER_REGULAR,
      fontSize: 13,
      lineHeight: 13 * 1.4,
    },
    bodySemiBold: {
      fontFamily: INTER_SEMIBOLD,
      fontSize: 14,
      lineHeight: 14 * 1.4,
    },
    label: {
      fontFamily: INTER_SEMIBOLD,
      fontSize: 12,
      lineHeight: 12 * 1.4,
    },
    caption: {
      fontFamily: INTER_REGULAR,
      fontSize: 11,
      lineHeight: 11 * 1.4,
    },
    chipMd: {
      fontFamily: INTER_SEMIBOLD,
      fontSize: 12,
      lineHeight: 12 * 1.4,
    },
    chipSm: {
      fontFamily: INTER_MEDIUM,
      fontSize: 11,
      lineHeight: 11 * 1.4,
    },
    tabLabelActive: {
      fontFamily: INTER_SEMIBOLD,
      fontSize: 10,
      lineHeight: 10 * 1.4,
    },
    tabLabelInactive: {
      fontFamily: INTER_MEDIUM,
      fontSize: 10,
      lineHeight: 10 * 1.4,
    },
  },

  iconSize: {
    sm: 12,
    md: 16,
    lg: 18,
    xl: 20,
  },

  borderRadius: {
    xs: getTextSize(0.125),
    sm: getTextSize(0.25),
    md: getTextSize(0.375),
    lg: getTextSize(0.5),
    xl: getTextSize(0.75),
    "2xl": getTextSize(1),
    "3xl": getTextSize(1.5),
    "4xl": getTextSize(2),
    full: 9999,
  },
} as const;
