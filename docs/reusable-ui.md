# Reusable UI Components

Shared app UI primitives live in `src/shadecn/ui/`. They are React Native components styled with `react-native-unistyles` and should use theme tokens instead of hard-coded design values.

## Components

### `Button`

Import from `src/shadecn/ui/button`.

- Variants: `primary`, `secondary`, `ghost`, `danger`, `text`
- Sizes: `sm`, `md`, `lg`
- Supports `icon`, `iconPosition`, `isLoading`, `disabled`, `dotted`, `textStyle`, and standard `Pressable` props
- String children are rendered with the shared `Text` component and themed button typography
- `isLoading` disables the button and replaces content with an activity indicator

### `Chip`

Import from `src/shadecn/ui/chip`.

- Variants: `default`, `ghost`
- Tones: `neutral`, `primary`, `ok`, `peach`, `warn`, `danger`
- Sizes: `sm`, `md`
- Use for compact statuses, filters, and tags
- Supports `label`, `onPress`, and `disabled`

### `Input`

Import from `src/shadecn/ui/input`.

- Sizes: `sm`, `md`, `lg`
- Supports `label`, `helperText`, `error`, `editable`, `multiline`, `containerStyle`, `inputStyle`, and standard `TextInput` props
- Use `leftSlot` and `rightSlot` for rendered adornments such as icons or action buttons
- `placeholderTextColor` defaults to the theme faint text color
- `selectionColor` uses the theme primary color

### `Dialog`

Import from `src/shadecn/ui/dialog`.

- Built on `@rn-primitives/dialog`
- Exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogCloseButton`, `DialogOverlay`, and `DialogPortal`
- Use for blocking confirmation and focused tasks
- `DialogContent` renders through a portal and includes the shared overlay treatment

### `Drawer`

Import from `src/shadecn/ui/drawer`.

- Built on `@expo/ui/community/bottom-sheet`
- Exports `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`, and `BottomSheet`
- Supports controlled and uncontrolled open state with `open`, `defaultOpen`, and `onOpenChange`
- `DrawerContent` accounts for bottom safe-area spacing

### `Text`

Import from `src/shadecn/ui/text`.

- Wraps React Native `Text`
- Applies shared base text styling
- Supports `asChild` for slot-based composition
- Reads typography overrides from `TextClassContext`, which is used by components such as `Button`

## Icons

SVG icons live in `src/icons/` and are implemented with `react-native-svg`.

- All icon components use the shared `Icon` / `IconProps` types from `src/icons/icons.d.ts`
- Icons accept standard `SvgProps`
- Stroke icons accept `color`, defaulting to `#000000`
- Grouped icon families expose a default object for variants, for example `Bell.Default`, `Bell.Plus`, `Bell.Ring`
- Pet icons are exported from `src/icons/pets`

Example:

```tsx
import { CatIcon } from "@/icons/pets";
import Bell from "@/icons/bell";

<CatIcon color={theme.palette.brand.primaryDefault} />;
<Bell.Ring color={theme.palette.brand.danger} />;
```

## Review Checklist

- Keep new reusable components in `src/shadecn/ui/` when they are intended for shared use.
- Use `StyleSheet.create((theme) => ({ ... }))` and theme tokens for colors, spacing, radii, typography, and shadows.
- Document public props that render actual UI. Do not expose placeholder props unless the component implements them.
- Ensure pressable components set accessibility role/label/state where needed.
- Keep icon color customizable through the `color` prop and preserve black as the default.
