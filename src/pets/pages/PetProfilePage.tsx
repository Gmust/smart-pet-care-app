import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CareTabContent } from "@/care/components/CareTabContent";
import { Chevron } from "@/icons/arrows";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { DeletePetConfirmation } from "../components/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/actions/UploadPetPhotoDrawer";
import { FlagChip } from "../components/FlagChip";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { HealthTabContent } from "../components/tabs/HealthTabContent";
import { OverviewTabContent } from "../components/tabs/OverviewTabContent";
import { RemindersTabContent } from "../components/tabs/RemindersTabContent";
import { usePetQuery } from "../queries/usePetQuery";
import { PetProfilePageSkeleton } from "../skeletons/PetProfilePageSkeleton";
import type { PetFlag } from "../types";
import { useLocalSearchParams, useRouter } from "expo-router";

const PROFILE_TAB_KEYS = ["overview", "health", "care", "reminders"] as const;
type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

export default function PetProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["pets", "common"]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview");
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pet, isLoading: isPetLoading } = usePetQuery(petId);
  const petName = pet?.name;

  const flags: PetFlag[] = [];
  if (pet) {
    if (pet.allergies) {
      flags.push({ id: "allergies", label: t("petProfilePage.flags.allergies"), tone: "warn" });
    }
    if (pet.chronicConditions) {
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/pets");
  };

  const handleOpenEdit = () => {
    setIsEditOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  if (isPetLoading) {
    return <PetProfilePageSkeleton />;
  }

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Button
            size="icon"
            variant="icon"
            accessibilityLabel={t("petProfilePage.goBack")}
            onPress={handleBack}
          >
            <Chevron width={18} height={18} color={palette.brand.primaryDark} />
          </Button>
          <Text style={styles.topBarTitle}>{petName}</Text>
          <PetProfilePageActions
            disabled={!pet}
            onEdit={handleOpenEdit}
            onChangePhoto={() => setIsPhotoOpen(true)}
            onDelete={handleOpenDeleteDialog}
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          {!!pet && activeTab === "overview" && <OverviewTabContent pet={pet} />}
          {!!pet && activeTab === "health" && <HealthTabContent petId={pet.id ?? ""} />}
          {!!pet && activeTab === "care" && <CareTabContent petId={pet.id ?? ""} />}
          {!!pet && activeTab === "reminders" && <RemindersTabContent petId={pet.id ?? ""} />}
        </ScrollView>
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
