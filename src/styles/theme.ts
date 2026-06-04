import { palette } from "./palette";

const BASE_SPACING = 4;
const BASE_TEXT_SIZE = 16;
const FONT_FAMILY = "Inter";
const DISPLAY_FONT_FAMILY = "Fraunces_700Bold";

const getTextSize = (s: number) => s * BASE_TEXT_SIZE;

export const theme = {
  palette,
  spacing: (v: number) => v * BASE_SPACING,
  textSizing: getTextSize,
  shadows: {
    dialog: "0px 4px 10px 0 rgba(0,0,0,0.35)",
  },
  fonts: {
    display: DISPLAY_FONT_FAMILY,
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
