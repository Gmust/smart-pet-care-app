# Reusable UI Components

Shared primitives live in `src/shadecn/ui/`. They are React Native components styled with
`react-native-unistyles` and must use theme tokens rather than hard-coded design values.

**Reach for a primitive before writing a new component.** Re-implementing one with raw
`Pressable` + `Text` + a stylesheet loses the pressed, disabled, and loading states, the
typography scale, the touch-target minimum, and the `role="button"` that assistive tech
depends on — and it drifts from `DESIGN.md` the moment a token changes.

## Which primitive do I need?

| You are building                               | Use                                               | Not                           |
| ---------------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Anything the user taps that performs an action | `Button`                                          | `Pressable` + `Text`          |
| A row of actions in a drawer or sheet          | `Button` (`size="lg"`)                            | hand-rolled pressable rows    |
| An icon-only control                           | `Button` `variant="icon"` `size="icon"`           | bare `Pressable` with an icon |
| Any text at all                                | `Text` from `@/shadecn/ui/text`                   | `Text` from `react-native`    |
| A text field                                   | `Input`                                           | raw `TextInput`               |
| A compact status, tag, or filter toggle        | `Chip`                                            | a small styled `View`         |
| A blocking confirmation                        | `Dialog`, or `DeleteConfirmDialog` for deletes    | a custom modal                |
| A bottom sheet                                 | `Drawer`                                          | a custom animated `View`      |
| A single-select from a list                    | `Select`                                          | a custom picker               |
| A contextual action menu                       | `DropdownMenu`                                    | a custom popover              |
| A boolean toggle                               | `Switch`                                          | a custom pressable            |
| A grouped content surface                      | `Card` / `ListCard`                               | a styled `View`               |
| A validation message under a field             | `FieldError`                                      | a styled `Text`               |
| A loading placeholder                          | `SkeletonBox` from `@/common/components/Skeleton` | a grey `View`                 |

## When a raw `Pressable` is fine

Not everything tappable is a button. Use `Pressable` directly when the thing is a **surface**
rather than an action — its content, not a label, is the point:

- list cards and rows whose whole area navigates or opens something
  (`PetListCard`, `ReminderRow`, `ActivityCard`)
- selectable rows carrying an avatar or rich content (`PetPickerDrawer`)
- custom controls with no `Button` equivalent (`TabBar`, `Fab`)

Even then: set `accessibilityRole`, give an `accessibilityLabel` when there is no visible text,
and keep the touch target at least 44×44 (use `hitSlop` when the visual is smaller).

Prefer `Pressable` over `TouchableOpacity` — the codebase standardises on it.

## Anti-patterns seen in review

**Hand-rolled action rows.** The activity actions drawer originally shipped as two `Pressable`
rows with their own border, radius, background, and pressed-opacity styles — about thirty lines
reproducing what `Button` already does, minus the disabled and loading states. It became:

```tsx
<Button size="lg" variant="secondary" icon={<TrashIcon … />} onPress={…}>
  {t("activity:actions.delete")}
</Button>
```

**Raw `Text` from `react-native`.** Bypasses the `variant` scale in `theme.textStyles`, so the
type drifts from `DESIGN.md`. Import `Text` from `@/shadecn/ui/text` and pass `variant`.

**Restyling a primitive to look like another one.** If `Button` needs a genuinely new look, add
a variant to `button.tsx` so every screen gets it — do not override it locally with `style`.

## Components

### `Button` — `@/shadecn/ui/button`

- Variants: `primary`, `secondary`, `ghost`, `danger`, `text`, `link`, `icon`
- Sizes: `sm`, `md`, `lg`, `icon`
- Props: `icon`, `iconPosition`, `isLoading`, `disabled`, `dotted`, `textStyle`, plus standard `Pressable` props
- String children render through the shared `Text` with themed button typography
- `isLoading` disables the button and swaps the content for an activity indicator
- **`icon` is rendered as given — `Button` does not tint it.** Pass the color explicitly to match
  the variant (see `AddButton`)

### `Text` — `@/shadecn/ui/text`

- `variant` maps to `theme.textStyles`: `display`, `titleL`, `titleM`, `body`, `bodyS`,
  `bodySemiBold`, `label`, `caption`
- Prefer a `variant` over ad-hoc `fontSize` / `fontFamily`

### `Input` — `@/shadecn/ui/input`

- Sizes: `sm`, `md`, `lg`
- Props: `label`, `helperText`, `error`, `editable`, `multiline`, `containerStyle`, `inputStyle`,
  plus standard `TextInput` props
- Use with TanStack Form field handlers only — never local state for field values

### `Chip` — `@/shadecn/ui/chip`

- Variants: `default`, `ghost`; tones: `neutral`, `primary`, `ok`, `peach`, `warn`, `danger`;
  sizes: `sm`, `md`
- Props: `label`, `icon`, `iconSize`, `onPress`, `disabled`
- Use for statuses, tags, and multi-select filter toggles

### `Dialog` — `@/shadecn/ui/dialog`

- Built on `@rn-primitives/dialog`
- Exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`,
  `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`
- For deletions use `DeleteConfirmDialog` from `@/common/components/DeleteConfirmDialog`
  rather than assembling a new one

### `Drawer` — `@/shadecn/ui/drawer`

- Built on `@gorhom/bottom-sheet`
- Exports `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`,
  `DrawerTitle`, `DrawerDescription`, `DrawerClose`, `DrawerCloseButton`, `DrawerScrollView`,
  `BottomSheet`, `BottomSheetScrollView`
- Hooks: `useDrawerNativeActivity`, `useDrawerSetOpen`, `useDrawerClose`
- Controlled via `open` / `onOpenChange`; `DrawerContent` handles bottom safe-area spacing
- Pass `scrollable` with `DrawerScrollView` for long forms

### `Select` — `@/shadecn/ui/select`

- Exports `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `SelectContent` needs a `portalHost`

### Others

- `DropdownMenu` — `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
- `Switch` — boolean toggle
- `Tabs` — tabbed sections
- `Card` / `ListCard` — grouped content surfaces
- `FieldError` — renders TanStack Form `field.state.meta.errors`

## Shared app components

Beyond the primitives, `src/common/components/` holds composites worth reusing:
`AddButton`, `BackButton`, `DeleteConfirmDialog`, `DateTimeField`, `SectionHeader`,
`SkeletonBox`, `ImagePicker`, `OfflineBanner`, `RouteErrorFallback`.

Check here before building a new one.
