import { cloneElement, useRef, useState } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Text } from "./text";

type TooltipProps = {
  /** The tapped element. It receives a ref, so it must be a host or ref-forwarding component. */
  trigger: ReactElement<{ ref?: Ref<View> }>;
  children: ReactNode;
  dismissLabel?: string;
  variant?: "peach" | "white";
};

export function Tooltip({ trigger, children, dismissLabel, variant = "peach" }: TooltipProps) {
  styles.useVariants({ variant });
  const { theme } = useUnistyles();
  const safeAreaInsets = useSafeAreaInsets();

  const triggerRef = useRef<View>(null);
  const [triggerCenter, setTriggerCenter] = useState<number | null>(null);
  const [cardLeft, setCardLeft] = useState<number | null>(null);

  const arrowSize = theme.spacing(3);
  const arrowLeft =
    triggerCenter !== null && cardLeft !== null ? triggerCenter - cardLeft - arrowSize / 2 : null;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) return;
        setCardLeft(null);
        triggerRef.current?.measureInWindow((x, _y, width) => setTriggerCenter(x + width / 2));
      }}
    >
      <DropdownMenuTrigger asChild>
        {cloneElement(trigger, { ref: triggerRef })}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={-theme.spacing(8)}
        // Room for the arrow's tip. Never flipped above the trigger: the arrow is on the top edge.
        sideOffset={theme.spacing(2.5)}
        avoidCollisions={false}
        insets={{ ...safeAreaInsets, left: theme.spacing(4), right: theme.spacing(4) }}
        style={styles.card}
        onLayout={(event) => {
          // Until the trigger is measured the primitive parks the card below the screen, so that
          // layout says nothing about where the card ends up; taking it moves the arrow later.
          if (event.nativeEvent.layout.y >= Dimensions.get("screen").height) return;
          setCardLeft(event.nativeEvent.layout.x);
        }}
      >
        {arrowLeft !== null && (
          <View
            pointerEvents="none"
            style={[
              styles.arrow,
              { left: arrowLeft, width: arrowSize, height: arrowSize, top: -(arrowSize / 2) - 1 },
            ]}
          />
        )}
        <Text variant="bodyS" style={styles.text}>
          {children}
        </Text>
        {!!dismissLabel && (
          <DropdownMenuItem style={styles.dismiss}>
            <Text variant="controlM" style={styles.dismissText}>
              {dismissLabel}
            </Text>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    overflow: "visible",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    boxShadow: `0 8px 24px ${theme.palette.brand.primaryDark}29`,
    variants: {
      variant: {
        peach: {
          width: theme.spacing(75),
          paddingTop: theme.spacing(3.5),
          paddingBottom: theme.spacing(2.5),
          backgroundColor: theme.palette.brand.peachIconBg,
        },
        white: {
          maxWidth: theme.spacing(75),
          paddingVertical: theme.spacing(3),
          backgroundColor: theme.palette.white,
        },
      },
    },
  },
  arrow: {
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    variants: {
      variant: {
        peach: { backgroundColor: theme.palette.brand.peachIconBg },
        white: { backgroundColor: theme.palette.white },
      },
    },
  },
  text: {
    variants: {
      variant: {
        peach: { color: theme.palette.brand.textSecondary },
        white: { color: theme.palette.brand.textPrimary },
      },
    },
  },
  dismiss: {
    alignSelf: "flex-end",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dismissText: {
    color: theme.palette.brand.primaryDefault,
  },
}));
