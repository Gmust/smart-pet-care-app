---
version: "alpha"
name: "Smart Pet Care"
description: "Warm, reassuring mobile design system for everyday pet care."
colors:
  primary: "#2d5e4e"
  primary-dark: "#1a3a2e"
  primary-soft: "#a3d9b8"
  primary-extra-soft: "#e1f5ee"
  success: "#285a3f"
  warning: "#c98a3e"
  danger: "#b84a3e"
  danger-background: "#faeada"
  peach: "#7a3a1a"
  peach-soft: "#fff8ec"
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
  display-lg:
    fontFamily: "Fraunces"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 56px
  display-md:
    fontFamily: "Fraunces"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
  heading-lg:
    fontFamily: "Fraunces"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  heading-md:
    fontFamily: "Fraunces"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 28px
  body-lg:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 26px
  body-md:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-sm:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-md:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 20px
  label-sm:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
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
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 54px
  button-primary-pressed:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.primary-soft}"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 54px
  button-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 54px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 52px
  chip-primary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger}"
    typography: "{typography.label-sm}"
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

The native font identifiers are `Fraunces_700Bold`, `Fraunces_400Regular`, and `Inter` in the Unistyles theme. The family names above describe their visual roles across platforms.

## Layout

Spacing follows a 4 px base unit through `theme.spacing(value)`. Prefer the named values represented above for common layout decisions, while allowing half-step values when compact native controls require them.

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
