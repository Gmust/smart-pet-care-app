import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CareTabContent } from "@/care/components/CareTabContent";
import { BackButton } from "@/common/components/BackButton";
import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { DeletePetConfirmation } from "../components/pet-profile/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/pet-profile/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/pet-profile/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/pet-profile/actions/UploadPetPhotoDrawer";
import { FlagChip } from "../components/pet-profile/FlagChip";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { HealthTabContent } from "../components/tabs/HealthTabContent";
import { OverviewTabContent } from "../components/tabs/OverviewTabContent";
import { RemindersTabContent } from "../components/tabs/RemindersTabContent";
import { usePetQuery } from "../queries/usePetQuery";
import { petProfileParamsSchema } from "../schemas/pet-profile-params.schema";
import { PetProfilePageSkeleton } from "../skeletons/PetProfilePageSkeleton";
import type { PetFlag } from "../types";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

const PROFILE_TAB_KEYS = ["overview", "health", "care", "reminders"] as const;
type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

export default function PetProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview");

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation(["pets", "common"]);

  const parsedParams = petProfileParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const { data: pet, isLoading: isPetLoading, refetch, isRefetching } = usePetQuery(petId);
  const petName = pet?.name;

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

  if (isPetLoading) {
    return <PetProfilePageSkeleton />;
  }

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <BackButton />
          <Text style={styles.topBarTitle}>{petName}</Text>
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
                <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} variant="hero" />
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
              <Text style={styles.emptyText}>{t("petProfilePage.notFound")}</Text>
            </Animated.View>
          ))}

        <Animated.View style={styles.segmentedTabs} layout={LinearTransition.duration(200)}>
          {PROFILE_TAB_KEYS.map((key) => {
            const isActive = key === activeTab;
            return (
              <Pressable
                key={key}
                style={styles.segmentTab}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(key)}
              >
                <Text
                  style={[styles.segmentText, isActive && styles.segmentTextActive]}
                  numberOfLines={1}
                >
                  {t(`petProfilePage.tabs.${key}`)}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.ScrollView
          key={activeTab}
          entering={tabsContentEntering}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {!!pet && activeTab === "overview" && <OverviewTabContent pet={pet} />}
          {!!pet && activeTab === "health" && <HealthTabContent petId={pet.id ?? ""} />}
          {!!pet && activeTab === "care" && <CareTabContent petId={pet.id ?? ""} />}
          {!!pet && activeTab === "reminders" && <RemindersTabContent petId={pet.id ?? ""} />}
        </Animated.ScrollView>
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
    ...theme.textStyles.titleL,
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
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  segmentedTabs: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(5),
  },
  segmentTab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(1),
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  segmentText: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
  segmentTextActive: {
    ...theme.textStyles.bodySemiBold,
    color: theme.palette.brand.primaryDefault,
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  emptyText: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
  },
}));
