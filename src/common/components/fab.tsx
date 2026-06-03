import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { ActivityIcon } from "@/icons/activity";
import { BellPlusIcon } from "@/icons/bell";
import { CalendarHeartIcon } from "@/icons/calendar-heart";
import { HeartPulseIcon } from "@/icons/heart";
import type { Icon } from "@/icons/icons";
import { PlusIcon } from "@/icons/plus";
import { UtensilsCrossedIcon } from "@/icons/utensils";
import { palette } from "@/styles/palette";

import "@/styles/config";
import type { FabActionTone } from "./fab-menu-item";
import { FabMenuItem } from "./fab-menu-item";
import * as Haptics from "expo-haptics";

type FabActionId = "reminder" | "feeding" | "symptom" | "health" | "activity";

type FabAction = {
  id: FabActionId;
  icon: Icon;
  tone: FabActionTone;
};

const ACTIONS: FabAction[] = [
  { id: "reminder", icon: BellPlusIcon, tone: "primary" },
  { id: "feeding", icon: UtensilsCrossedIcon, tone: "primary" },
  { id: "symptom", icon: HeartPulseIcon, tone: "peach" },
  { id: "health", icon: CalendarHeartIcon, tone: "peach" },
  { id: "activity", icon: ActivityIcon, tone: "neutral" },
];

type FabProps = {
  onAction?: (id: string) => void;
};

export function Fab({ onAction }: FabProps) {
  const { t } = useTranslation(["common"]);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  const toggle = (next: boolean) => {
    setOpen(next);
    rotation.value = withTiming(next ? 45 : 0, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleAction = (id: string) => {
    toggle(false);
    onAction?.(id);
  };

  const bottomOffset = insets.bottom + BAR_CLEARANCE;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {open && (
        <>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={t("fab.close")}
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(180)}
            onPress={() => toggle(false)}
            style={styles.overlay}
          />
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutDown.duration(160)}
            style={[styles.sheet, { bottom: bottomOffset + FAB_SIZE + 12 }]}
          >
            {ACTIONS.map((action) => (
              <FabMenuItem
                key={action.id}
                icon={action.icon}
                tone={action.tone}
                title={t(`fab.actions.${action.id}.title`)}
                subtitle={t(`fab.actions.${action.id}.subtitle`)}
                onPress={() => handleAction(action.id)}
              />
            ))}
          </Animated.View>
        </>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? t("fab.close") : t("fab.open")}
        accessibilityState={{ expanded: open }}
        onPress={() => toggle(!open)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: bottomOffset },
          pressed && styles.fabPressed,
        ]}
      >
        <Animated.View style={iconStyle}>
          <PlusIcon width={24} height={24} color={palette.brand.textOnDark} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FAB_SIZE = 56;
const BAR_CLEARANCE = 80;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Dimming baked into the color so the FadeIn/FadeOut layout animation
    // owns `opacity` without conflict (primaryDark #1a3a2e @ 18%).
    backgroundColor: "rgba(26,58,46,0.18)",
  },
  sheet: {
    position: "absolute",
    right: theme.spacing(4),
    width: theme.spacing(55),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius["2xl"],
    padding: theme.spacing(3),
    gap: theme.spacing(1),
    shadowColor: theme.palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  fab: {
    position: "absolute",
    right: theme.spacing(4),
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryDefault,
    shadowColor: theme.palette.brand.primaryDefault,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.9,
  },
}));
