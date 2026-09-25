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
import * as Haptics from "expo-haptics";

import { CreateActivityDrawer } from "@/activity/components/drawers/CreateActivityDrawer";
import { PetPickerDrawer } from "@/activity/components/drawers/PetPickerDrawer";
import { HealthRecordType } from "@/api/generated";
import { AddHealthRecordDrawer } from "@/health/components/drawers/AddHealthRecordDrawer";
import { ActivityIcon } from "@/icons/activity";
import { BellPlusIcon } from "@/icons/bell";
import { CalendarHeartIcon } from "@/icons/calendar";
import { HeartPulseIcon } from "@/icons/heart";
import type { Icon } from "@/icons/icons";
import { PlusIcon } from "@/icons/plus";
import { CreatePetDrawer } from "@/pets/components/actions/CreatePetDrawer";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";
import { CreateReminderDrawer } from "@/reminders/components/CreateReminderDrawer";
import { palette } from "@/styles/palette";

import { hexToRGBA } from "../utils/colors";

import type { FabActionTone } from "./FabMenuItem";
import { FabMenuItem } from "./FabMenuItem";

type FabActionId = "reminder" | "symptom" | "health" | "activity";

type FabAction = {
  id: FabActionId;
  icon: Icon;
  tone: FabActionTone;
};

// "Log feeding" used to sit second in this list. It opened nothing — no feeding
// drawer or query exists anywhere in the app, and the endpoints aren't even
// exported from @/api — so it was removed rather than left as a dead row. Put
// it back here once a feeding log is actually built.
const ACTIONS: FabAction[] = [
  { id: "reminder", icon: BellPlusIcon, tone: "primary" },
  { id: "symptom", icon: HeartPulseIcon, tone: "peach" },
  { id: "health", icon: CalendarHeartIcon, tone: "peach" },
  { id: "activity", icon: ActivityIcon, tone: "neutral" },
];

export function Fab() {
  const { t } = useTranslation(["common"]);
  const insets = useSafeAreaInsets();
  const { data: pets } = usePetsQuery();
  const [open, setOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isHealthRecordOpen, setIsHealthRecordOpen] = useState(false);
  const [isSymptomOpen, setIsSymptomOpen] = useState(false);
  const [isCreatePetOpen, setIsCreatePetOpen] = useState(false);
  const [isActivityPetPickerOpen, setIsActivityPetPickerOpen] = useState(false);
  // CreateActivityDrawer takes a required petId and has no picker step of its
  // own, so the FAB resolves the pet first — silently, when there is only one.
  const [activityPetId, setActivityPetId] = useState<string | null>(null);
  const rotation = useSharedValue(0);

  const hasPets = (pets?.length ?? 0) > 0;

  const toggle = (next: boolean) => {
    setOpen(next);
    rotation.value = withTiming(next ? 45 : 0, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFabPress = () => {
    // Quick actions all require a pet, so until one exists the FAB routes
    // straight to pet creation instead of opening the actions menu.
    if (!hasPets) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsCreatePetOpen(true);
      return;
    }

    toggle(!open);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleAction = (id: FabActionId) => {
    toggle(false);
    if (id === "reminder") {
      setIsReminderOpen(true);
    }
    if (id === "health") {
      setIsHealthRecordOpen(true);
    }
    if (id === "symptom") {
      setIsSymptomOpen(true);
    }
    if (id === "activity") {
      const onlyPetId = pets?.length === 1 ? pets[0].id : undefined;
      if (onlyPetId) {
        setActivityPetId(onlyPetId);
        return;
      }
      setIsActivityPetPickerOpen(true);
    }
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
        accessibilityLabel={!hasPets ? t("fab.addPet") : open ? t("fab.close") : t("fab.open")}
        accessibilityState={{ expanded: open }}
        onPress={handleFabPress}
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

      <CreateReminderDrawer isOpen={isReminderOpen} setIsOpen={setIsReminderOpen} />
      <AddHealthRecordDrawer isOpen={isHealthRecordOpen} setIsOpen={setIsHealthRecordOpen} />
      <AddHealthRecordDrawer
        isOpen={isSymptomOpen}
        setIsOpen={setIsSymptomOpen}
        type={HealthRecordType.Symptom}
      />
      <CreatePetDrawer isOpen={isCreatePetOpen} setIsOpen={setIsCreatePetOpen} />
      <PetPickerDrawer
        isOpen={isActivityPetPickerOpen}
        setIsOpen={setIsActivityPetPickerOpen}
        pets={pets ?? []}
        selectedPetId={activityPetId ?? undefined}
        onSelect={setActivityPetId}
      />
      {!!activityPetId && (
        <CreateActivityDrawer
          isOpen
          setIsOpen={(open) => {
            if (!open) setActivityPetId(null);
          }}
          petId={activityPetId}
        />
      )}
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
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.18),
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
