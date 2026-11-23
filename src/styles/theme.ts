import { palette } from "./palette";

const BASE_SPACING = 4;

// Font family names as registered with `useFonts` in _layout.tsx (via @expo-google-fonts/inter and
// @expo-google-fonts/fraunces). They must match the useFonts() keys exactly: React Native silently
// falls back to the system font instead of erroring.
const fontFamily = {
  display: "Fraunces_600SemiBold",
  displayRegular: "Fraunces_400Regular",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
};

const fontPx = {
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  17: 17,
  19: 19,
  24: 24,
  32: 32,
};

// Figma uses 1.2x for display/title, but Fraunces needs about 1.233x: below that Android trims the
// line and clips descenders, so keep this above 1.233.
const LINE_HEIGHT_TIGHT = 1.25;
const LINE_HEIGHT_NORMAL = 1.4;

const DISPLAY_LETTER_SPACING_EM = -0.008;
const TITLE_L_LETTER_SPACING_EM = -0.005;
const CONTROL_L_LETTER_SPACING_EM = -0.002;
const LABEL_CAPS_LETTER_SPACING_EM = 0.003;

export const theme = {
  palette,
  spacing: (v: number) => v * BASE_SPACING,

  shadows: {
    dialog: "0px 4px 10px 0 rgba(0,0,0,0.35)",
    // A CSS-style string, not shadow*/elevation: Android ignores shadowOpacity/shadowRadius and
    // draws the heavier Material shadow for `elevation`.
    card: "0px 1px 4px 0 rgba(26,58,46,0.06)",
  },

  fontFamily,
  fontPx,

  textStyles: {
    display: {
      fontFamily: fontFamily.display,
      fontSize: fontPx[32],
      lineHeight: fontPx[32] * LINE_HEIGHT_TIGHT,
      letterSpacing: fontPx[32] * DISPLAY_LETTER_SPACING_EM,
    },
    titleL: {
      fontFamily: fontFamily.displayRegular,
      fontSize: fontPx[24],
      lineHeight: fontPx[24] * LINE_HEIGHT_TIGHT,
      letterSpacing: fontPx[24] * TITLE_L_LETTER_SPACING_EM,
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
    labelCaps: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[12],
      lineHeight: fontPx[12] * LINE_HEIGHT_NORMAL,
      letterSpacing: fontPx[12] * LABEL_CAPS_LETTER_SPACING_EM,
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: fontPx[11],
      lineHeight: fontPx[11] * LINE_HEIGHT_NORMAL,
    },
    // No lineHeight on the Control styles: Figma sets Auto.
    controlS: {
      fontFamily: fontFamily.medium,
      fontSize: fontPx[11],
    },
    controlM: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[12],
    },
    controlL: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontPx[17],
      letterSpacing: fontPx[17] * CONTROL_L_LETTER_SPACING_EM,
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
    "3xl": 32,
  },

  // Smallest tappable area the app ships, per the platform guidelines. A floor,
  // not a size: pad a smaller visual up to it with hitSlop.
  minTouchTarget: 44,

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
