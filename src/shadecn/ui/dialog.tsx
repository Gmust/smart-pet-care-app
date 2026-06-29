import React from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";
import * as DialogPrimitive from "@rn-primitives/dialog";

import { hexToRGBA } from "@/common/utils/colors";

import { BlurView } from "expo-blur";

export type DialogHandler = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const overlayEntering = FadeIn.duration(220);
const overlayExiting = FadeOut.duration(180);
const contentTransition = LinearTransition.springify().damping(18).stiffness(180).mass(0.8);

function DialogOverlay({
  children,
  style,
  ...props
}: DialogPrimitive.OverlayProps &
  React.PropsWithChildren & { ref?: React.RefObject<DialogPrimitive.OverlayRef> }) {
  return (
    <DialogPrimitive.Overlay
      style={(state) => [
        StyleSheet.absoluteFill,
        styles.overlay,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <BlurView intensity={5} style={styles.overlayBlur}>
        <Animated.View
          style={styles.overlayAnimated}
          entering={overlayEntering}
          exiting={overlayExiting}
        >
          {children}
        </Animated.View>
      </BlurView>
    </DialogPrimitive.Overlay>
  );
}

function DialogContent({
  children,
  portalHost = "dialog",
  style,
  ...props
}: DialogPrimitive.ContentProps & {
  ref?: React.RefObject<DialogPrimitive.ContentRef>;
  portalHost?: string;
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <Animated.View
          layout={contentTransition}
          entering={overlayEntering}
          exiting={overlayExiting}
        >
          <DialogPrimitive.Content style={[styles.content, style]} {...props}>
            {children}
          </DialogPrimitive.Content>
        </Animated.View>
      </DialogOverlay>
    </DialogPortal>
  );
}

function DialogHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />;
}

function DialogFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />;
}

function DialogTitle({
  style,
  ...props
}: DialogPrimitive.TitleProps & {
  ref?: React.RefObject<DialogPrimitive.TitleRef>;
}) {
  return <DialogPrimitive.Title style={[styles.title, style]} {...props} />;
}

function DialogDescription({
  style,
  ...props
}: DialogPrimitive.DescriptionProps & {
  ref?: React.RefObject<DialogPrimitive.DescriptionRef>;
}) {
  return <DialogPrimitive.Description style={[styles.description, style]} {...props} />;
}

function DialogCloseButton({
  style,
  size = 22,
  ...props
}: DialogPrimitive.CloseProps & {
  ref?: React.RefObject<DialogPrimitive.CloseRef>;
  size?: number;
}) {
  const { theme } = useUnistyles();

  return (
    <DialogPrimitive.Close
      style={(state) => [styles.close, typeof style === "function" ? style(state) : style]}
      accessibilityLabel="Close"
      {...props}
    >
      <Ionicons name="close" size={size} color={theme.palette.slate[600]} />
    </DialogPrimitive.Close>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: { flex: 1, backgroundColor: hexToRGBA(theme.palette.white, 0.4) },
  overlayBlur: { flex: 1 },
  overlayAnimated: { flex: 1, justifyContent: "center" },
  content: {
    boxShadow: theme.shadows.dialog,
    marginHorizontal: theme.spacing(4),
    gap: theme.spacing(4),
    borderRadius: theme.borderRadius["3xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(8),
  },
  header: { gap: theme.spacing(1.5), textAlign: "center" },
  footer: { gap: theme.spacing(2) },
  title: {
    textAlign: "center",
    fontFamily: theme.fonts.black,
    fontSize: theme.fontSize.xl,
    textTransform: "uppercase",
    letterSpacing: -0.25,
    color: theme.palette.black,
  },
  description: { color: theme.palette.black },
  close: {
    position: "absolute",
    top: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 50,
    outlineWidth: 0,
  },
}));

export {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
