---
version: "alpha"
name: "Smart Pet Care"
description: "Warm, reassuring mobile design system for everyday pet care."
colors:
  primary: "#2d5e4e"
  primary-dark: "#1a3a2e"
  primary-mid: "#7bb290"
  primary-soft: "#a3d9b8"
  primary-extra-soft: "#e1f5ee"
  toast: "#e2a04f"
  success: "#285a3f"
  warning: "#c98a3e"
  warning-soft: "#f5c98a"
  danger: "#b84a3e"
  danger-dark: "#8a372e"
  danger-background: "#fae6da"
  danger-background-mid: "#eec8bc"
  peach: "#7a3a1a"
  peach-mid: "#c97a4a"
  peach-soft: "#fff8ec"
  peach-icon-background: "#fff2d3"
  peach-tint: "#faeada"
  page: "#f5f1ea"
  surface: "#ffffff"
  surface-sunken: "#ede6da"
  border: "#d6d3c8"
  text-primary: "#2d3b36"
  text-body: "#4a5651"
  text-secondary: "#8a9a93"
  text-faint: "#b8c3be"
  text-on-dark: "#f5f1ea"
typography:
  display:
    fontFamily: "Fraunces"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.256px
  title-l:
    fontFamily: "Fraunces"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 30px
    letterSpacing: -0.12px
  title-m:
    fontFamily: "Fraunces"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 23.75px
  body:
    fontFamily: "Inter"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 21px
  body-s:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18.2px
  body-semibold:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 19.6px
  label:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16.8px
  label-caps:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16.8px
    letterSpacing: 0.036px
  caption:
    fontFamily: "Inter"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 15.4px
  control-s:
    fontFamily: "Inter"
    fontSize: 11px
    fontWeight: 500
  control-m:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 600
  control-l:
    fontFamily: "Inter"
    fontSize: 17px
    fontWeight: 600
    letterSpacing: -0.034px
  tab-label-active:
    fontFamily: "Inter"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 14px
  tab-label-inactive:
    fontFamily: "Inter"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 14px
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  3xl: 24px
  4xl: 32px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  page:
    backgroundColor: "{colors.page}"
    textColor: "{colors.text-primary}"
    padding: "{spacing.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-dark}"
    typography: "{typography.control-l}"
    rounded: "{rounded.lg}"
    height: 54px
  button-primary-pressed:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.primary-soft}"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.control-l}"
    rounded: "{rounded.lg}"
    height: 54px
  button-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger}"
    typography: "{typography.control-l}"
    rounded: "{rounded.lg}"
    height: 54px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: 52px
  chip-primary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.control-m}"
    rounded: "{rounded.full}"
  chip-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger}"
    typography: "{typography.control-m}"
    rounded: "{rounded.full}"
---

## Overview

Smart Pet Care should feel calm, warm, and trustworthy. The visual language combines soft cream surfaces and rounded controls with a restrained forest-green brand palette. It should feel caring without becoming childish or clinical.

The source of truth for implementation tokens remains `src/styles/palette.ts` and `src/styles/theme.ts`. Keep this document synchronized when those foundations or shared components change.

## Colors

Use forest green for primary actions and important active states. Cream page and sunken surfaces create warmth; white is reserved for cards, inputs, and elevated controls. Semantic red and amber should communicate status, not decorate neutral content.

Text uses softened green-gray tones instead of pure black. Maintain strong contrast for primary content and reserve `text-secondary` and `text-faint` for supporting or disabled information.

## Typography

Fraunces gives page titles and major section headings a friendly editorial character. Inter carries body text, labels, controls, and dense information. Use Fraunces selectively; operational UI should remain highly legible in Inter.

The native font identifiers are `Fraunces_600SemiBold` and `Fraunces_400Regular` for Fraunces, and `Inter_400Regular`, `Inter_500Medium` and `Inter_600SemiBold` for Inter. The token names above match `theme.textStyles`; set text through `Text` with a `variant` or spread a `theme.textStyles` entry, never assemble family and size by hand. Line heights are 1.25× for Fraunces and 1.4× for Inter; the control styles leave line height automatic, as Figma does. Letter spacing is stored in the theme in pixels and is 0.3% of the size for `label-caps`.

## Layout

Spacing follows a 4 px base unit through `theme.spacing(value)`; the named `spacing` scale above is a reference for common decisions, and code uses the multiplier directly (including half steps such as `spacing(2.5)` for compact controls).

Mobile pages generally use 16–20 px horizontal padding, clear vertical grouping, and generous bottom space around tab or gesture areas. Cards group related information rather than serving as decoration.

## Elevation & Depth

Create hierarchy primarily with surface color, borders, and spacing. Shadows should be subtle and uncommon. Drawers, dialogs, and floating menus may use elevation when separation from the underlying page is necessary.

## Shapes

Controls use 8 px radii, cards commonly use 12–16 px radii, and chips or icon buttons use full rounding. Avoid mixing unrelated corner radii within the same component family.

## Components

Shared primitives live in `src/shadecn/ui/`. Reuse their variants before introducing page-local alternatives. Interactive components need visible pressed, disabled, loading, error, and focus states where the platform supports them.

Primary buttons are dark green with warm cream text. Secondary actions use soft green. Destructive actions use a pale danger surface with dark red content. Inputs use white or sunken surfaces with a visible border and a green focused state.

## Do's and Don'ts

- Do use semantic tokens from the Unistyles theme instead of inline color values.
- Do preserve readable contrast and native touch target sizes.
- Do use Fraunces to establish hierarchy, not for long-form body text or compact controls.
- Do keep pet imagery and status information visually prominent without crowding actions.
- Don't introduce bright, saturated accents that compete with the earthy palette.
- Don't rely on color alone to communicate errors, status, or selection.
- Don't add shadows where a border, surface change, or spacing can establish hierarchy.
