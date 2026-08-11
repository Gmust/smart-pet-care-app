import React from "react";
import type { PressableProps, StyleProp, ViewProps, ViewStyle } from "react-native";
import { AppState, BackHandler, Keyboard, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import * as Slot from "@rn-primitives/slot";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "./text";

const TRANSPARENT_WHITE = "rgba(255, 255, 255, 0)";
/**
 * Spacing-unit height of the footer's top fade (see `footerFade` below).
 * Scrollable drawer content needs at least this much bottom padding, or the
 * last item can never fully scroll clear of the fade.
 */
export const DRAWER_FOOTER_FADE_SPACING = 30;
/**
 * gorhom's own Android default is a fixed 250ms regardless of how far the
 * sheet travels — fine for a short sheet (DateFilterDrawer's 45%), but a
 * 90%+ sheet covers far more distance in that same window, reading as
 * rushed. Same easing curve as the library default, just a bit longer so it
 * holds up across snapPoints of very different heights.
 */
const DRAWER_ANIMATION_CONFIGS = {
  duration: 350,
  easing: Easing.out(Easing.exp),
};
type BackdropPressBehavior = React.ComponentProps<typeof BottomSheetBackdrop>["pressBehavior"];

//TODO try expo ui drawer, could fix side activity problem
type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  modalRef: React.RefObject<BottomSheetModal | null>;
  /** When true, header/footer render edge fades over the scrollable content. */
  scrollable?: boolean;
  /**
   * Wrap a same-Activity native dialog (date/time picker): its focus-steal
   * collapses the sheet and fires `onDismiss`; while at least one is pending that
   * dismiss is swallowed, and the sheet is snapped back on Activity return.
   * Returns undefined outside a drawer.
   */
  beginNativeActivity?: () => () => void;
  /**
   * Flags the next `onDismiss` as a deliberate user close, so it's never
   * swallowed by the native-activity recovery logic above — see
   * `useDrawerClose()` for why that swallow can otherwise fire on a genuine
   * close right after a date/time picker.
   */
  markUserRequestedClose?: () => void;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

/**
 * For same-Activity native dialogs (date/time picker) that only collapse the
 * sheet. Full-screen pickers (image library/camera) pause the Activity and
 * dismiss the modal outright — those must instead close and reopen the drawer
 * via {@link useDrawerSetOpen}, not this.
 */
export function useDrawerNativeActivity() {
  return React.useContext(DrawerContext)?.beginNativeActivity;
}

/** Imperatively open/close the enclosing drawer. Undefined outside a drawer. */
export function useDrawerSetOpen() {
  return React.useContext(DrawerContext)?.setOpen;
}

/**
 * Gracefully close the enclosing drawer — gorhom's own `close()`, the same
 * one the backdrop tap uses internally. Prefer this over
 * `useDrawerSetOpen()(false)` for user-triggered closes from inside the
 * sheet: `setOpen(false)` routes through `BottomSheetModal.dismiss()`
 * (`forceClose()` internally), which visibly desyncs the backdrop's opacity
 * fade from the sheet's own position animation — `close()` doesn't have
 * that problem. Only usable inside `DrawerContent`'s children (throws
 * otherwise, per gorhom's `useBottomSheet`); `open` state still ends up
 * correct afterward via the existing `onDismiss` → `setOpen(false)` wiring.
 *
 * Marks the close as user-requested first (see `markUserRequestedClose` on
 * the context) — without that, closing right after a date/time picker can
 * race the native-activity recovery logic in `DrawerContent` and have the
 * sheet silently re-present itself instead of closing.
 */
export function useDrawerClose() {
  const markUserRequestedClose = React.useContext(DrawerContext)?.markUserRequestedClose;
  const close = useBottomSheet().close;

  return React.useCallback(() => {
    markUserRequestedClose?.();
    close();
  }, [close, markUserRequestedClose]);
}

type DrawerProps = React.PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

type DrawerTriggerProps = PressableProps & {
  asChild?: boolean;
  ref?: React.RefObject<React.ComponentRef<typeof Pressable> | null>;
};

type DrawerCloseProps = PressableProps & {
  asChild?: boolean;
  ref?: React.RefObject<React.ComponentRef<typeof Pressable> | null>;
};

type DrawerContentProps = React.PropsWithChildren<
  Omit<React.ComponentProps<typeof BottomSheetModal>, "children" | "ref"> & {
    ref?: React.RefObject<BottomSheetModal | null>;
    contentStyle?: StyleProp<ViewStyle>;
    backdropPressBehavior?: BackdropPressBehavior;
    /**
     * Use a flex-filling `View` wrapper instead of `BottomSheetView` so a
     * `BottomSheetScrollView` child can bound itself to the sheet height and
     * actually scroll (gorhom's `BottomSheetView` is absolutely positioned and
     * content-sized, which breaks nested scrollables). Requires fixed
     * `snapPoints` with `enableDynamicSizing={false}`.
     */
    scrollable?: boolean;
  }
>;

function useDrawerContext(componentName: string) {
  const context = React.useContext(DrawerContext);

  if (!context) {
    throw new Error(`${componentName} must be used within Drawer.`);
  }

  return context;
}

function Drawer({ open: openProp, defaultOpen = false, onOpenChange, children }: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const modalRef = React.useRef<BottomSheetModal>(null);
  const isControlled = openProp !== undefined;
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(() => ({ open, setOpen, modalRef }), [open, setOpen]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

function DrawerTrigger({ asChild = false, onPress, ...props }: DrawerTriggerProps) {
  const { setOpen } = useDrawerContext("DrawerTrigger");
  const Component = asChild ? Slot.Pressable : Pressable;

  return (
    <Component
      {...props}
      onPress={(event) => {
        onPress?.(event);
        setOpen(true);
      }}
    />
  );
}

function DrawerClose({ asChild = false, onPress, ...props }: DrawerCloseProps) {
  const { setOpen } = useDrawerContext("DrawerClose");
  const Component = asChild ? Slot.Pressable : Pressable;

  return (
    <Component
      {...props}
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
      }}
    />
  );
}

type DrawerCloseButtonProps = Omit<PressableProps, "children"> & {
  size?: number;
};

/** Absolute-positioned "X" in the top-right corner of the drawer that dismisses it. */
function DrawerCloseButton({ size = 22, style, onPress, ...props }: DrawerCloseButtonProps) {
  useDrawerContext("DrawerCloseButton");
  const close = useDrawerClose();
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={8}
      style={(state) => [styles.closeButton, typeof style === "function" ? style(state) : style]}
      onPress={(event) => {
        onPress?.(event);
        close();
      }}
      {...props}
    >
      <Ionicons name="close" size={size} color={theme.palette.slate[600]} />
    </Pressable>
  );
}

function DrawerContent({
  children,
  enableDynamicSizing = true,
  enablePanDownToClose = true,
  index = 0,
  onDismiss,
  contentStyle,
  backdropPressBehavior = "close",
  scrollable = false,
  enableContentPanningGesture,
  keyboardBehavior,
  keyboardBlurBehavior = "restore",
  android_keyboardInputMode = "adjustResize",
  animationConfigs = DRAWER_ANIMATION_CONFIGS,
  onChange,
  onAnimate,
  ...props
}: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const { modalRef, open, setOpen } = useDrawerContext("DrawerContent");
  const openRef = React.useRef(open);
  React.useEffect(() => {
    openRef.current = open;
  }, [open]);
  const nativeActivityCountRef = React.useRef(0);
  // A same-Activity dialog's focus steal can dismiss the modal; keep swallowing
  // those dismisses (and re-presenting) until the sheet reports visible again.
  const isRecoveringNativeActivityRef = React.useRef(false);
  // Set right before any close path we control (close button, hardware back)
  // calls close()/dismiss(), so onDismiss always honors it even if a stale
  // isRecoveringNativeActivityRef is still true from an earlier picker.
  const userRequestedCloseRef = React.useRef(false);
  const markUserRequestedClose = React.useCallback(() => {
    userRequestedCloseRef.current = true;
  }, []);

  // Only dismiss the keyboard on close if one is actually showing. gorhom's
  // forceClose() (used by the imperative `.dismiss()` — close button/backdrop
  // triggers `close()` instead) sets an internal isForcedClosing flag that
  // makes it ignore any KEYBOARD-sourced position re-evaluation. Calling
  // Keyboard.dismiss() unconditionally kicks off that re-evaluation anyway,
  // which then gets silently dropped — two uncoordinated layout changes
  // landing at once reads as a jerky close. Skipping the call entirely when
  // there's no keyboard to begin with (e.g. DateFilterDrawer, no text
  // inputs) avoids triggering that path at all.
  const isKeyboardVisibleRef = React.useRef(false);
  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      isKeyboardVisibleRef.current = true;
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      isKeyboardVisibleRef.current = false;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Android hardware back / gesture nav currently falls through to whatever
  // the underlying screen does with it, closing an open drawer only by
  // accident (or not at all). Intercept it here and close gracefully via
  // the same close() gorhom's own backdrop tap uses (not dismiss()/
  // forceClose() — see useDrawerClose() above for why that matters).
  React.useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      markUserRequestedClose();
      modalRef.current?.close();
      return true;
    });
    return () => subscription.remove();
  }, [open, modalRef, markUserRequestedClose]);

  const beginNativeActivity = React.useCallback(() => {
    nativeActivityCountRef.current += 1;
    isRecoveringNativeActivityRef.current = true;
    let ended = false;
    return () => {
      if (ended) return;
      ended = true;
      nativeActivityCountRef.current -= 1;
      if (nativeActivityCountRef.current === 0 && openRef.current) {
        modalRef.current?.present();
      }
    };
  }, [modalRef]);

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior={backdropPressBehavior}
        // gorhom's own close() runs on backdrop tap, bypassing useDrawerClose() —
        // mark it here too, or a tap right after a native picker re-presents the sheet.
        onPress={markUserRequestedClose}
      />
    ),
    [backdropPressBehavior, markUserRequestedClose]
  );
  const contextValue = React.useMemo(
    () => ({ open, setOpen, modalRef, scrollable, beginNativeActivity, markUserRequestedClose }),
    [beginNativeActivity, markUserRequestedClose, modalRef, open, scrollable, setOpen]
  );

  // Computed once — React.Children.toArray re-keys on every call, so find/filter must share a result.
  const childrenArray = React.Children.toArray(children);
  const footerChild = scrollable
    ? childrenArray.find(
        (child): child is React.ReactElement =>
          React.isValidElement(child) && child.type === DrawerFooter
      )
    : undefined;
  const contentChildren = footerChild
    ? childrenArray.filter((child) => child !== footerChild)
    : children;
  const renderFooter = footerChild
    ? (footerProps: BottomSheetFooterProps) => (
        <BottomSheetFooter
          {...footerProps}
          bottomInset={insets.bottom}
          style={styles.floatingFooter}
        >
          <DrawerContext.Provider value={contextValue}>{footerChild}</DrawerContext.Provider>
        </BottomSheetFooter>
      )
    : undefined;

  React.useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    if (open) {
      modal.present();
    } else {
      modal.dismiss();
    }
  }, [modalRef, open]);

  // A same-Activity native dialog (date/time picker) steals window focus and
  // drops the sheet to its closed position without unmounting the modal. On
  // Activity return, snap it back. Full-screen pickers (image library/camera)
  // are handled differently — they close and reopen the drawer entirely — so
  // this only fires for the collapse case.
  React.useEffect(() => {
    const restore = () => {
      if (open && nativeActivityCountRef.current === 0) {
        modalRef.current?.snapToIndex(index >= 0 ? index : 0);
      }
    };
    const changeSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") restore();
    });
    const focusSubscription = AppState.addEventListener("focus", restore);
    return () => {
      changeSubscription.remove();
      focusSubscription.remove();
    };
  }, [index, modalRef, open]);

  return (
    <BottomSheetModal
      {...props}
      ref={modalRef}
      index={index}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        // A deliberate close (close button, hardware back) always wins, even
        // if isRecoveringNativeActivityRef is still stuck true from a picker
        // that closed moments earlier — otherwise this dismiss can lose the
        // race against that flag's reset and get swallowed/reopened below.
        if (userRequestedCloseRef.current) {
          userRequestedCloseRef.current = false;
          setOpen(false);
          onDismiss?.();
          return;
        }
        // A same-Activity dialog (date/time picker) can report this dismiss even
        // after its promise settled. Keep swallowing native-activity dismisses —
        // re-presenting the sheet — until it reports a visible index again, then
        // allow real user dismisses through.
        if (isRecoveringNativeActivityRef.current) {
          if (nativeActivityCountRef.current === 0 && openRef.current) {
            modalRef.current?.present();
          }
          return;
        }
        setOpen(false);
        onDismiss?.();
      }}
      onChange={(sheetIndex, position, type) => {
        if (sheetIndex >= 0 && nativeActivityCountRef.current === 0) {
          isRecoveringNativeActivityRef.current = false;
        }
        onChange?.(sheetIndex, position, type);
      }}
      onAnimate={(fromIndex, toIndex, fromPosition, toPosition) => {
        // Fires right before the close animation starts (unlike onChange,
        // which only reflects the index once it's actually reached — i.e.
        // after the animation finishes — and unlike `open` state, which the
        // backdrop tap/swipe bypass until their own dismiss completes).
        // Dismissing here keeps a focused field's keyboard from lingering
        // visible over an already-closed sheet. Only when one is actually
        // showing — see isKeyboardVisibleRef above for why.
        if (toIndex === -1 && isKeyboardVisibleRef.current) {
          Keyboard.dismiss();
        }
        onAnimate?.(fromIndex, toIndex, fromPosition, toPosition);
      }}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose={enablePanDownToClose}
      // In scrollable mode the inner KeyboardAwareScrollView owns the vertical
      // gesture + keyboard avoidance, so gorhom's content pan and its
      // (edge-to-edge-unreliable) keyboard shifting are turned off.
      enableContentPanningGesture={enableContentPanningGesture ?? !scrollable}
      keyboardBehavior={keyboardBehavior ?? (scrollable ? "extend" : "interactive")}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={android_keyboardInputMode}
      animationConfigs={animationConfigs}
      footerComponent={renderFooter ?? props.footerComponent}
    >
      <DrawerContext.Provider value={contextValue}>
        {scrollable ? (
          <View
            style={[
              styles.content,
              styles.contentFill,
              styles.contentScrollable,
              { paddingBottom: insets.bottom + 24 },
              contentStyle,
            ]}
          >
            {contentChildren}
          </View>
        ) : (
          <BottomSheetView
            style={[styles.content, { paddingBottom: insets.bottom + 24 }, contentStyle]}
          >
            {children}
          </BottomSheetView>
        )}
      </DrawerContext.Provider>
    </BottomSheetModal>
  );
}

function DrawerHeader({ style, children, ...props }: ViewProps) {
  const { scrollable } = useDrawerContext("DrawerHeader");
  const { theme } = useUnistyles();

  return (
    <View style={[styles.header, scrollable && styles.headerScrollable, style]} {...props}>
      {children}
      {scrollable ? (
        <LinearGradient
          pointerEvents="none"
          colors={[theme.palette.white, TRANSPARENT_WHITE]}
          style={styles.headerFade}
        />
      ) : null}
    </View>
  );
}

function DrawerFooter({ style, children, ...props }: ViewProps) {
  const { scrollable } = useDrawerContext("DrawerFooter");
  const { theme } = useUnistyles();

  return (
    <View style={[styles.footer, scrollable && styles.footerScrollable, style]} {...props}>
      {scrollable ? (
        <LinearGradient
          pointerEvents="none"
          colors={[TRANSPARENT_WHITE, theme.palette.white]}
          locations={[0, 0.55]}
          style={styles.footerFade}
        />
      ) : null}
      {children}
    </View>
  );
}

// Keyboard-aware scroll for scrollable drawers. Uses react-native-keyboard-controller
// (accurate native keyboard insets) instead of gorhom's RN-keyboard tracking, which is
// unreliable on Android edge-to-edge. Pair with `DrawerContent scrollable`.
function DrawerScrollView({
  bottomOffset = 24,
  keyboardShouldPersistTaps = "handled",
  ...props
}: React.ComponentProps<typeof KeyboardAwareScrollView>) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={bottomOffset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    />
  );
}

function DrawerTitle({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="titleL" style={[styles.title, style]} {...props} />;
}

function DrawerDescription({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text style={[styles.description, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(6),
    paddingHorizontal: theme.spacing(6),
    paddingTop: theme.spacing(2),
  },
  contentFill: {
    flex: 1,
  },
  // Scrollable drawers butt the header/footer against the scroll so the edge
  // fades line up with the scroll's top/bottom instead of a flex gap.
  contentScrollable: {
    gap: 0,
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(4),
    zIndex: 3,
    width: theme.spacing(8),
    height: theme.spacing(8),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.slate[100],
  },
  header: {
    paddingHorizontal: theme.spacing(10),
    gap: theme.spacing(2),
  },
  headerScrollable: {
    zIndex: 2,
    paddingBottom: theme.spacing(2),
  },
  headerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    height: theme.spacing(7),
  },
  footer: {
    gap: theme.spacing(3),
  },
  footerScrollable: {
    zIndex: 2,
    paddingTop: theme.spacing(6),
  },
  footerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: theme.spacing(DRAWER_FOOTER_FADE_SPACING),
  },
  floatingFooter: {
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
  title: {
    textTransform: "uppercase",
    color: theme.palette.slate[950],
    textAlign: "center",
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.4),
    color: theme.palette.slate[600],
  },
}));

export {
  BottomSheet,
  BottomSheetScrollView,
  Drawer,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
  DrawerTrigger,
};
