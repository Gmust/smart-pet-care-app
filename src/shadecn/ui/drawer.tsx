import React from "react";
import type { PressableProps, StyleProp, ViewProps, ViewStyle } from "react-native";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Slot from "@rn-primitives/slot";

import { Text } from "./text";
import { LinearGradient } from "expo-linear-gradient";

const TRANSPARENT_WHITE = "rgba(255, 255, 255, 0)";
type BackdropPressBehavior = React.ComponentProps<typeof BottomSheetBackdrop>["pressBehavior"];

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  modalRef: React.RefObject<BottomSheetModal | null>;
  /** When true, header/footer render edge fades over the scrollable content. */
  scrollable?: boolean;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

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
  const { setOpen } = useDrawerContext("DrawerCloseButton");
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={8}
      style={(state) => [styles.closeButton, typeof style === "function" ? style(state) : style]}
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
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
  ...props
}: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const { modalRef, open, setOpen } = useDrawerContext("DrawerContent");

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior={backdropPressBehavior}
      />
    ),
    [backdropPressBehavior]
  );
  const contextValue = React.useMemo(
    () => ({ open, setOpen, modalRef, scrollable }),
    [modalRef, open, setOpen, scrollable]
  );

  React.useEffect(() => {
    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    if (open) {
      modal.present();
      return;
    }

    modal.dismiss();
  }, [modalRef, open]);

  return (
    <BottomSheetModal
      {...props}
      ref={modalRef}
      index={index}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        setOpen(false);
        onDismiss?.();
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
            {children}
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
  return <Text style={[styles.title, style]} {...props} />;
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
    height: theme.spacing(30),
  },
  title: {
    fontFamily: theme.fonts.black,
    fontSize: theme.fontSize["2xl"],
    textTransform: "uppercase",
    letterSpacing: -0.4,
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
