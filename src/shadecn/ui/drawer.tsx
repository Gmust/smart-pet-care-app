import React from "react";
import { Pressable, PressableProps, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Slot from "@rn-primitives/slot";

import { Text } from "./text";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  modalRef: React.RefObject<BottomSheetModal | null>;
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
  Omit<
    React.ComponentProps<typeof BottomSheetModal>,
    | "children"
    | "ref"
    | "backdropComponent"
    | "backgroundStyle"
    | "handleIndicatorStyle"
    | "handleStyle"
    | "style"
  > & {
    ref?: React.RefObject<BottomSheetModal | null>;
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

function DrawerContent({
  children,
  enableDynamicSizing = true,
  enablePanDownToClose = true,
  index = 0,
  onDismiss,
  topInset = 24,
  ...props
}: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const { modalRef, open, setOpen } = useDrawerContext("DrawerContent");
  const contextValue = React.useMemo(
    () => ({ open, setOpen, modalRef }),
    [modalRef, open, setOpen]
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

  const renderBackdrop = React.useCallback(
    (backdropProps: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.28}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      {...props}
      ref={modalRef}
      index={index}
      topInset={topInset}
      onDismiss={() => {
        setOpen(false);
        onDismiss?.();
      }}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose={enablePanDownToClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.sheet}
    >
      <DrawerContext.Provider value={contextValue}>
        <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {children}
        </BottomSheetView>
      </DrawerContext.Provider>
    </BottomSheetModal>
  );
}

function DrawerHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />;
}

function DrawerFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />;
}

function DrawerTitle({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text style={[styles.title, style]} {...props} />;
}

function DrawerDescription({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text style={[styles.description, style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  sheet: {
    shadowColor: theme.palette.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetBackground: {
    borderTopLeftRadius: theme.borderRadius["4xl"],
    borderTopRightRadius: theme.borderRadius["4xl"],
    backgroundColor: theme.palette.white,
  },
  handle: {
    paddingTop: theme.spacing(2),
  },
  handleIndicator: {
    width: theme.spacing(12),
    height: theme.spacing(1.25),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.slate[300],
  },
  content: {
    gap: theme.spacing(6),
    paddingHorizontal: theme.spacing(6),
    paddingTop: theme.spacing(2),
  },
  header: {
    gap: theme.spacing(2),
  },
  footer: {
    gap: theme.spacing(3),
  },
  title: {
    fontFamily: theme.fonts.black,
    fontSize: theme.fontSize["2xl"],
    textTransform: "uppercase",
    letterSpacing: -0.4,
    color: theme.palette.slate[950],
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.4),
    color: theme.palette.slate[600],
  },
}));

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
