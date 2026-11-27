import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type EntryAnimationsValues,
  type ExitAnimationsValues,
  FadeIn,
  FadeOut,
  LinearTransition,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

import { BackButton } from "@/common/components/BackButton";
import { PetPickerDrawer } from "@/common/components/PetPickerDrawer";
import { PetSwitcher } from "@/common/components/PetSwitcher";
import { PhotoViewer } from "@/common/components/PhotoViewer";
import { QueryErrorState } from "@/common/components/QueryErrorState";
import { usePetSelection } from "@/common/hooks/usePetSelection";
import { useRefreshControl } from "@/common/hooks/useRefreshControl";
import { FeedingTabContent } from "@/feeding/components/FeedingTabContent";
import { useFeedingRefresh } from "@/feeding/hooks/useFeedingRefresh";
import { HealthTabContent } from "@/health/components/HealthTabContent";
import { healthQueryKeys } from "@/health/queries/healthQueryKeys";
import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Tabs, tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";
import { WellnessTabContent } from "@/wellness/components/WellnessTabContent";
import { useWellnessRefresh } from "@/wellness/hooks/useWellnessRefresh";

import { CreatePetDrawer } from "../components/actions/CreatePetDrawer";
import { DeletePetConfirmation } from "../components/pet-profile/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/pet-profile/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/pet-profile/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/pet-profile/actions/UploadPetPhotoDrawer";
import { FlagChip } from "../components/pet-profile/FlagChip";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { OverviewTabContent } from "../components/tabs/OverviewTabContent";
import { useBackToOrigin } from "../hooks/useBackToOrigin";
import { usePetHeroHeight } from "../hooks/usePetHeroHeight";
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
  wellness: [],
  feeding: [],
};

type Props = {
  showBack?: boolean;
};

export default function PetProfilePage({ showBack = false }: Props) {
  const parsedParams = petProfileParamsSchema.safeParse(useLocalSearchParams());

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(
    (parsedParams.success && parsedParams.data.tab) || "overview"
  );
  const checkedParamPetIdRef = useRef<string | undefined>(undefined);

  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const heroHeight = usePetHeroHeight();
  const router = useRouter();
  const { t } = useTranslation(["pets", "common"]);

  const paramPetId = parsedParams.success ? parsedParams.data.petId : undefined;
  const {
    pets,
    isLoading: isPetsLoading,
    isError: isPetsError,
    refetch: refetchPets,
    selectedPetId: petId,
    setSelectedPetId,
  } = usePetSelection();
  const goBackToOrigin = useBackToOrigin(parsedParams.success ? parsedParams.data.from : undefined);
  const queryClient = useQueryClient();
  const { data: pet, isLoading: isPetLoading } = usePetQuery(petId);
  // The pet key also covers its notes, so the Overview tab needs nothing more.
  const profileRefresh = useRefreshControl(() =>
    Promise.all(
      [["pets", petId ?? ""] as const, ...PROFILE_TAB_REFRESH_KEYS[activeTab]].map((queryKey) =>
        queryClient.refetchQueries({ queryKey, type: "active" })
      )
    )
  );
  const wellnessRefresh = useWellnessRefresh(petId);
  const feedingRefresh = useFeedingRefresh();
  const { isRefreshing, onRefresh } = {
    overview: profileRefresh,
    health: profileRefresh,
    wellness: wellnessRefresh,
    feeding: feedingRefresh,
  }[activeTab];
  const petName = pet?.name;
  const tabParam = parsedParams.success ? parsedParams.data.tab : undefined;

  // A link to a pet (from Home, a note) selects it, once the pets are known. Before paint, so the
  // previous pet is not shown. The boolean keeps a later refetch from re-applying the link over a
  // pet picked from the switcher.
  const isParamPetKnown = !!paramPetId && !!pets?.some((pet) => pet.id === paramPetId);
  useLayoutEffect(() => {
    if (paramPetId && isParamPetKnown) setSelectedPetId(paramPetId);
  }, [paramPetId, isParamPetKnown, setSelectedPetId]);

  // A link to a pet that is gone keeps the current selection and says so once for that id.
  useEffect(() => {
    if (!paramPetId || !pets || checkedParamPetIdRef.current === paramPetId) return;
    checkedParamPetIdRef.current = paramPetId;
    if (!pets.some((pet) => pet.id === paramPetId)) {
      Toast.show({ type: "error", text1: t("petProfilePage.notFound") });
    }
  }, [paramPetId, pets, t]);

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
      flags.push({
        id: "allergies",
        label: t("petProfilePage.flags.allergies"),
        details: (pet.allergies ?? []).filter(Boolean),
      });
    }
    if (hasChronicConditions) {
      flags.push({
        id: "chronic-conditions",
        label: t("petProfilePage.flags.chronicCondition"),
        details: (pet.chronicConditions ?? []).filter(Boolean),
      });
    }
  }

  // The hero photo grows out of, and shrinks back into, the switcher's avatar circle. The target
  // is where that avatar sits in the top bar: its padding, the back button when shown, chip border
  // and chip padding.
  const avatarSize = theme.spacing(9);
  const avatarInset = theme.spacing(0.375) + theme.spacing(1);
  const avatarX =
    theme.spacing(4) + (showBack ? theme.spacing(9) + theme.spacing(2) : 0) + avatarInset;
  const avatarY = insets.top + theme.spacing(2) + avatarInset;
  const heroRadius = theme.borderRadius["2xl"];
  const heroDuration = 260;

  const heroEntering = (values: EntryAnimationsValues) => {
    "worklet";
    return {
      initialValues: {
        originX: avatarX,
        originY: avatarY,
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        opacity: 0,
      },
      animations: {
        originX: withTiming(values.targetOriginX, { duration: heroDuration }),
        originY: withTiming(values.targetOriginY, { duration: heroDuration }),
        width: withTiming(values.targetWidth, { duration: heroDuration }),
        height: withTiming(values.targetHeight, { duration: heroDuration }),
        borderRadius: withTiming(heroRadius, { duration: heroDuration }),
        opacity: withTiming(1, { duration: heroDuration / 2 }),
      },
    };
  };

  const heroExiting = (values: ExitAnimationsValues) => {
    "worklet";
    return {
      initialValues: {
        originX: values.currentOriginX,
        originY: values.currentOriginY,
        width: values.currentWidth,
        height: values.currentHeight,
        borderRadius: heroRadius,
        opacity: 1,
      },
      animations: {
        originX: withTiming(avatarX, { duration: heroDuration }),
        originY: withTiming(avatarY, { duration: heroDuration }),
        width: withTiming(avatarSize, { duration: heroDuration }),
        height: withTiming(avatarSize, { duration: heroDuration }),
        borderRadius: withTiming(avatarSize / 2, { duration: heroDuration }),
        opacity: withDelay(heroDuration - 60, withTiming(0, { duration: 60 })),
      },
    };
  };

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

  if (isPetsLoading || isPetLoading) {
    return <PetProfilePageSkeleton />;
  }

  // A failed list is not an empty one: offering "add a pet" would invite a duplicate.
  if (isPetsError && !pets) {
    return <QueryErrorState onRetry={() => refetchPets()} onBackPress={goBackToOrigin} />;
  }

  if (!pets?.length) {
    return (
      <>
        <View style={[styles.screen, styles.emptyScreen, { paddingTop: insets.top }]}>
          {showBack && (
            <View style={[styles.emptyBack, { top: insets.top + theme.spacing(2) }]}>
              <BackButton onBackPress={goBackToOrigin} />
            </View>
          )}
          <Text variant="body" style={styles.emptyText}>
            {t("petProfilePage.empty.title")}
          </Text>
          <Button onPress={() => setIsCreateOpen(true)}>{t("petProfilePage.empty.action")}</Button>
        </View>

        <CreatePetDrawer
          isOpen={isCreateOpen}
          setIsOpen={setIsCreateOpen}
          onCreated={(createdPet) => {
            if (createdPet.id) setSelectedPetId(createdPet.id);
          }}
        />
      </>
    );
  }

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + theme.spacing(2) }]}>
          <View style={styles.topBarLeading}>
            {showBack && <BackButton onBackPress={goBackToOrigin} />}
            {!!pet && (
              <PetSwitcher
                selectedPet={pet}
                canSwitch
                showAvatar={activeTab !== "overview"}
                onPress={() => setIsPickerOpen(true)}
              />
            )}
          </View>
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
              style={[styles.hero, { height: heroHeight }]}
              entering={heroEntering}
              exiting={heroExiting}
            >
              {pet.photoUrl ? (
                <PhotoViewer uri={pet.photoUrl} style={StyleSheet.absoluteFill}>
                  <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} variant="hero" />
                </PhotoViewer>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("petProfilePage.actions.changePhoto")}
                  style={StyleSheet.absoluteFill}
                  onPress={() => setIsPhotoOpen(true)}
                >
                  <PetSpeciesImage species={pet.species} variant="hero" />
                </Pressable>
              )}
              <View style={styles.aiButton}>
                <Button
                  accessibilityLabel={t("pets:petProfilePage.assistantButton")}
                  variant="iconOnPhoto"
                  size="icon"
                  disabled={!pet?.id}
                  icon={<AiIcon width={16} height={16} color={palette.brand.peachIconBg} />}
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
              style={[styles.hero, styles.heroEmpty, { height: heroHeight }]}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              <Text variant="body" style={styles.emptyText}>
                {t("petProfilePage.notFound")}
              </Text>
            </Animated.View>
          ))}

        <Animated.View layout={LinearTransition.duration(200)} style={styles.tabs}>
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
            {!!pet?.id && activeTab === "wellness" && <WellnessTabContent petId={pet.id} />}
            {!!pet?.id && activeTab === "feeding" && (
              <FeedingTabContent
                petId={pet.id}
                onSeeAllMeals={() =>
                  router.push({ pathname: "/(tabs)/pets/feeding-log", params: { petId: pet.id } })
                }
                onOpenAnalysis={() =>
                  router.push({
                    pathname: "/(tabs)/pets/nutrition-analysis",
                    params: { petId: pet.id },
                  })
                }
                onOpenSchedule={() => router.push("/(tabs)/reminders")}
                onOpenWeightHistory={() =>
                  router.push({
                    pathname: "/(tabs)/pets/weight-history",
                    params: { petId: pet.id },
                  })
                }
              />
            )}
          </Animated.ScrollView>
        </GestureDetector>
      </View>
      <PetPickerDrawer
        isOpen={isPickerOpen}
        setIsOpen={setIsPickerOpen}
        pets={pets ?? []}
        selectedPetId={petId}
        onSelect={setSelectedPetId}
        onCreatePet={() => setIsCreateOpen(true)}
      />

      <CreatePetDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onCreated={(createdPet) => {
          if (createdPet.id) setSelectedPetId(createdPet.id);
        }}
      />

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
  topBarLeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  tabs: {
    zIndex: 1,
  },
  hero: {
    flexShrink: 0,
    marginHorizontal: theme.spacing(4),
    marginBottom: theme.spacing(3),
    borderRadius: theme.borderRadius["2xl"],
    overflow: "hidden",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  emptyScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(6),
  },
  emptyBack: {
    position: "absolute",
    left: theme.spacing(4),
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
    pointerEvents: "box-none",
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
