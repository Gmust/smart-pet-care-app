import { palette } from "./palette";

const BASE_SPACING = 4;

// ---------------------------------------------------------------------------
// LEGACY — Tailwind-style rem scale, does not match Figma values exactly.
// Kept temporarily so existing usages across the app keep compiling while we
// migrate screen by screen. Do not use these in new code.
// TODO(remove-legacy-theme-tokens): delete FONT_FAMILY, DISPLAY_FONT_FAMILY,
// getTextSize, theme.fonts (old keys), theme.fontSize (old keys) once
// `graphify query` / grep shows zero remaining references.
// ---------------------------------------------------------------------------
const BASE_TEXT_SIZE = 16;
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

// Raw font family primitives — exposed in case a component needs the family
// without a full textStyle (e.g. combining with a custom size). textStyles
// below is built from these, so there is exactly one place that defines
// "what Frances-semibold actually is".
const fontFamily = {
  display: FRAUNCES_SEMIBOLD,
  displayRegular: FRAUNCES_REGULAR,
  regular: INTER_REGULAR,
  medium: INTER_MEDIUM,
  semiBold: INTER_SEMIBOLD,
};

// Raw pixel sizes actually used in the Figma file. textStyles below picks
// from this set instead of writing sizes as bare numbers.
const fontPx = {
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  19: 19,
  24: 24,
  32: 32,
};

// Line-height multiplier per size bucket, matching the Figma line-height
// values (display/title use a tighter 1.2x, body/label/caption/chip use 1.4x).
const LINE_HEIGHT_TIGHT = 1.2;
const LINE_HEIGHT_NORMAL = 1.4;

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
    thin: "Inter_100Thin",
    extraLight: "Inter_200ExtraLight",
    light: "Inter_300Light",
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
    black: "Inter_900Black",
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

  fontFamily,
  fontPx,

  // Semantic text styles — mirror the named "Text styles" list in the Figma
  // Styles panel 1:1 (Display, Body, Label, Caption, Title/L, Title/M,
  // Body/S, Body/SemiBold, Chip/md, Chip/sm, TabLabel/active, TabLabel/inactive).
  // Composed from fontFamily/fontPx above — prefer these over composing
  // fontFamily + fontPx + lineHeight by hand in every component, that's the
  // duplication we're trying to get rid of.
  textStyles: {
    display: {
      fontFamily: fontFamily.display,
      fontSize: fontPx[32],
      lineHeight: fontPx[32] * LINE_HEIGHT_TIGHT,
    },
    titleL: {
      fontFamily: fontFamily.displayRegular,
      fontSize: fontPx[24],
      lineHeight: fontPx[24] * LINE_HEIGHT_TIGHT,
    },
    titleM: {
      fontFamily: fontFamily.displayRegular,
      fontSize: fontPx[19],
      lineHeight: fontPx[19] * LINE_HEIGHT_TIGHT,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: fontPx[15],
      lineHeight: fontPx[15] * LINE_HEIGHT_NORMAL,
    },
    bodyS: {
      fontFamily: fontFamily.regular,
      fontSize: fontPx[13],
      lineHeight: fontPx[13] * LINE_HEIGHT_NORMAL,
    },
    bodySemiBold: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[14],
      lineHeight: fontPx[14] * LINE_HEIGHT_NORMAL,
    },
    label: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[12],
      lineHeight: fontPx[12] * LINE_HEIGHT_NORMAL,
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: fontPx[11],
      lineHeight: fontPx[11] * LINE_HEIGHT_NORMAL,
    },
    chipMd: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[12],
      lineHeight: fontPx[12] * LINE_HEIGHT_NORMAL,
    },
    chipSm: {
      fontFamily: fontFamily.medium,
      fontSize: fontPx[11],
      lineHeight: fontPx[11] * LINE_HEIGHT_NORMAL,
    },
    tabLabelActive: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[10],
      lineHeight: fontPx[10] * LINE_HEIGHT_NORMAL,
    },
    tabLabelInactive: {
      fontFamily: fontFamily.medium,
      fontSize: fontPx[10],
      lineHeight: fontPx[10] * LINE_HEIGHT_NORMAL,
    },
  },

  iconSize: {
    sm: 12,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
  },

  // ---------------------------------------------------------------------
  // borderRadius — own pixel scale, intentionally independent from text
  // sizing. It previously rode on getTextSize (a text-scale helper), which
  // meant the legacy-removal TODO above could never actually reach zero
  // references. Values below are unchanged from before, just expressed as
  // a standalone scale.
  // ---------------------------------------------------------------------
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
    "4xl": 32,
    full: 9999,
  },
} as const;
