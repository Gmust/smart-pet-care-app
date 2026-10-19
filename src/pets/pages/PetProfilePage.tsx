import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

import { BackButton } from "@/common/components/BackButton";
import { PhotoViewer } from "@/common/components/PhotoViewer";
import { useRefreshControl } from "@/common/hooks/useRefreshControl";
import { HealthTabContent } from "@/health/components/HealthTabContent";
import { healthQueryKeys } from "@/health/queries/healthQueryKeys";
import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Tabs, tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { DeletePetConfirmation } from "../components/pet-profile/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/pet-profile/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/pet-profile/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/pet-profile/actions/UploadPetPhotoDrawer";
import { FlagChip } from "../components/pet-profile/FlagChip";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { EmptyTabPlaceholder } from "../components/tabs/EmptyTabPlaceholder";
import { OverviewTabContent } from "../components/tabs/OverviewTabContent";
import { RemindersTabContent } from "../components/tabs/RemindersTabContent";
import { useBackToOrigin } from "../hooks/useBackToOrigin";
import { usePetQuery } from "../queries/usePetQuery";
import {
  petProfileParamsSchema,
  PROFILE_TAB_KEYS,
  type ProfileTabKey,
} from "../schemas/pet-profile-params.schema";
import { PetProfilePageSkeleton } from "../skeletons/PetProfilePageSkeleton";
import type { PetFlag } from "../types";

const PROFILE_TAB_REFRESH_KEYS: Record<ProfileTabKey, readonly (readonly string[])[]> = {
  overview: [],
  health: [healthQueryKeys.allRecords()],
  care: [],
  reminders: [["reminders"]],
};

export default function PetProfilePage() {
  const parsedParams = petProfileParamsSchema.safeParse(useLocalSearchParams());

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(
    (parsedParams.success && parsedParams.data.tab) || "overview"
  );

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation(["pets", "common"]);

  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const goBackToOrigin = useBackToOrigin(parsedParams.success ? parsedParams.data.from : undefined);
  const queryClient = useQueryClient();
  const { data: pet, isLoading: isPetLoading } = usePetQuery(petId);
  // The pet key also covers its notes, so the Overview tab needs nothing more.
  const { isRefreshing, onRefresh } = useRefreshControl(() =>
    Promise.all(
      [["pets", petId ?? ""] as const, ...PROFILE_TAB_REFRESH_KEYS[activeTab]].map((queryKey) =>
        queryClient.refetchQueries({ queryKey, type: "active" })
      )
    )
  );
  const petName = pet?.name;
  const tabParam = parsedParams.success ? parsedParams.data.tab : undefined;

  // Re-opening a mounted screen with another tab changes its params, not its state.
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  // Deep links can carry arbitrary params — never fetch with an unvalidated id.
  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  const flags: PetFlag[] = [];
  if (pet) {
    const hasAllergies = (pet.allergies ?? []).some(Boolean);
    const hasChronicConditions = (pet.chronicConditions ?? []).some(Boolean);

    if (hasAllergies) {
      flags.push({ id: "allergies", label: t("petProfilePage.flags.allergies"), tone: "warn" });
    }
    if (hasChronicConditions) {
      flags.push({
        id: "chronic-conditions",
        label: t("petProfilePage.flags.chronicCondition"),
        tone: "warn",
      });
    }
    if (!flags.length && pet.species) {
      flags.push({ id: "species", label: pet.species, tone: "ok" });
    }
  }

  const goToTabBy = (offset: number) => {
    const nextIndex = PROFILE_TAB_KEYS.indexOf(activeTab) + offset;
    if (nextIndex >= 0 && nextIndex < PROFILE_TAB_KEYS.length) {
      setActiveTab(PROFILE_TAB_KEYS[nextIndex]);
    }
  };

  const swipeTabs = Gesture.Race(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => goToTabBy(1)),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .runOnJS(true)
      .onEnd(() => goToTabBy(-1))
  );

  if (isPetLoading) {
    return <PetProfilePageSkeleton />;
  }

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <BackButton onBackPress={goBackToOrigin} />
          <Text variant="titleL" style={styles.topBarTitle}>
            {petName}
          </Text>
          <PetProfilePageActions
            disabled={!pet}
            onEdit={() => setIsEditOpen(true)}
            onChangePhoto={() => setIsPhotoOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </View>

        {activeTab === "overview" &&
          (pet ? (
            <Animated.View
              style={styles.hero}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              {pet.photoUrl ? (
                <PhotoViewer uri={pet.photoUrl} style={StyleSheet.absoluteFill}>
                  <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} variant="hero" />
                </PhotoViewer>
              ) : (
                <PetSpeciesImage species={pet.species} variant="hero" />
              )}
              <View style={styles.aiButton}>
                <Button
                  accessibilityLabel="ai-assistant"
                  variant="icon"
                  size="icon"
                  disabled={!pet?.id}
                  icon={<AiIcon width={20} height={20} color={palette.brand.textPrimary} />}
                  onPress={() =>
                    router.navigate({
                      pathname: "/(tabs)/assistant",
                      params: { petId: pet?.id },
                    })
                  }
                />
              </View>
              <View style={styles.flagRow}>
                {flags.map((flag) => (
                  <FlagChip key={flag.id} flag={flag} />
                ))}
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              style={[styles.hero, styles.heroEmpty]}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              <Text variant="body" style={styles.emptyText}>
                {t("petProfilePage.notFound")}
              </Text>
            </Animated.View>
          ))}

        <Animated.View layout={LinearTransition.duration(200)}>
          <Tabs
            items={PROFILE_TAB_KEYS.map((key) => ({
              key,
              label: t(`petProfilePage.tabs.${key}`),
            }))}
            value={activeTab}
            onChange={setActiveTab}
          />
        </Animated.View>

        <GestureDetector gesture={swipeTabs}>
          <Animated.ScrollView
            key={activeTab}
            entering={tabsContentEntering}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          >
            {!!pet && activeTab === "overview" && <OverviewTabContent pet={pet} />}
            {!!pet && activeTab === "health" && <HealthTabContent pet={pet} />}
            {!!pet && activeTab === "care" && (
              <EmptyTabPlaceholder label={t("petProfilePage.careComingSoon")} />
            )}
            {!!pet && activeTab === "reminders" && <RemindersTabContent petId={pet.id ?? ""} />}
          </Animated.ScrollView>
        </GestureDetector>
      </View>
      {!!pet && <EditPetDrawer pet={pet} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />}

      {!!pet?.id && (
        <UploadPetPhotoDrawer petId={pet.id} isOpen={isPhotoOpen} setIsOpen={setIsPhotoOpen} />
      )}

      {!!pet && (
        <DeletePetConfirmation
          petId={pet.id ?? ""}
          petName={petName ?? ""}
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  topBarTitle: {
    flex: 1,
    minWidth: 0,
    letterSpacing: -0.12,
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  hero: {
    height: theme.spacing(38.5),
    overflow: "hidden",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  heroEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  aiButton: {
    position: "absolute",
    top: theme.spacing(3),
    right: theme.spacing(4),
  },
  flagRow: {
    position: "absolute",
    left: theme.spacing(3.5),
    right: theme.spacing(3.5),
    bottom: theme.spacing(1.5),
    // Chips are not interactive: let every tap reach the photo underneath.
    pointerEvents: "none",
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  emptyText: {
    color: theme.palette.brand.textSecondary,
  },
}));
