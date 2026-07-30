import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

import { BackButton } from "@/common/components/BackButton";
import { AiIcon } from "@/icons/ai-icon";
import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import type { TabItem } from "@/shadecn/ui/tabs";
import { Tabs, tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { DeletePetConfirmation } from "../components/pet-profile/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/pet-profile/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/pet-profile/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/pet-profile/actions/UploadPetPhotoDrawer";
import { InfoRow } from "../components/pet-profile/InfoRow";
import { PetRemindersTab } from "../components/pet-profile/PetRemindersTab";
import { SectionHeader } from "../components/pet-profile/SectionHeader";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { usePetQuery } from "../queries/usePetQuery";
import { petProfileParamsSchema } from "../schemas/pet-profile-params.schema";
import { PetProfilePageSkeleton } from "../skeletons/PetProfilePageSkeleton";

export default function PetProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation(["pets", "common"]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const parsedParams = petProfileParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const { data: pet, isLoading: isPetLoading, refetch, isRefetching } = usePetQuery(petId);
  const petName = pet?.name;

  // Deep links can carry arbitrary params — never fetch with an unvalidated id.
  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  const tabs: TabItem[] = [
    { key: "overview", label: t("petProfilePage.tabs.overview") },
    { key: "activity", label: t("petProfilePage.tabs.activity") },
    { key: "health", label: t("petProfilePage.tabs.health") },
    { key: "reminders", label: t("petProfilePage.tabs.reminders") },
  ];

  const birthDate = pet?.birthDate ? dayjs(pet.birthDate) : null;
  const birthdayValue = birthDate?.isValid()
    ? birthDate.format("MMM D, YYYY")
    : t("petProfilePage.fallbacks.notAdded");

  const weightValue = !pet?.weightKg
    ? t("petProfilePage.fallbacks.notAdded")
    : t("petProfilePage.weightValue", { value: pet?.weightKg });

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
          <BackButton />
          <Text style={styles.topBarTitle}>{petName}</Text>
          <PetProfilePageActions
            disabled={!pet}
            onEdit={handleOpenEdit}
            onChangePhoto={() => setIsPhotoOpen(true)}
            onDelete={handleOpenDeleteDialog}
          />
        </View>

        {pet ? (
          <View style={styles.hero}>
            <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} variant="hero" />
            <View style={styles.aiButton}>
              <Button
                accessibilityLabel="ai-assistant"
                variant="icon"
                size="icon"
                disabled={!pet?.id}
                icon={<AiIcon width={20} height={20} color={palette.brand.textPrimary} />}
                onPress={() =>
                  router.navigate({ pathname: "/(tabs)/assistant", params: { petId: pet?.id } })
                }
              />
            </View>
          </View>
        ) : (
          <View style={[styles.hero, styles.heroEmpty]}>
            <Text style={styles.emptyText}>{t("petProfilePage.notFound")}</Text>
          </View>
        )}

        <Tabs items={tabs} value={activeTab} onChange={setActiveTab} variant="segmented" />

        <Animated.ScrollView
          key={activeTab}
          entering={tabsContentEntering}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {!!pet && activeTab === "overview" && (
            <>
              <SectionHeader label={t("petProfilePage.basics.title")} />
              <View style={styles.listCard}>
                <InfoRow
                  label={t("petProfilePage.basics.species")}
                  value={pet.species ?? t("petProfilePage.fallbacks.speciesUnknown")}
                />
                <InfoRow
                  label={t("petProfilePage.basics.breed")}
                  value={pet.breed ?? t("petProfilePage.fallbacks.breedUnknown")}
                />
                <InfoRow label={t("petProfilePage.basics.birthday")} value={birthdayValue} />
                <InfoRow
                  label={t("petProfilePage.basics.sex")}
                  value={pet.sex ?? t("sex.Unknown")}
                />
                <InfoRow label={t("petProfilePage.basics.weight")} value={weightValue} />
              </View>

              <View style={styles.notesHeader}>
                <View style={styles.notesLabelRow}>
                  <SectionHeader label={t("petProfilePage.notes.title")} compact />
                  <CirclePlusIcon width={20} height={20} color={palette.brand.textSecondary} />
                </View>
                <Button variant="text" accessibilityLabel={t("petProfilePage.notes.manageA11y")}>
                  <Text style={styles.manageText}>{t("petProfilePage.notes.manage")}</Text>
                </Button>
              </View>
            </>
          )}

          {!!pet?.id && activeTab === "reminders" && <PetRemindersTab petId={pet.id} />}
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
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    lineHeight: theme.fontSize["2xl"],
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
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  listCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing(5),
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  notesLabelRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  manageText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.primaryDefault,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(5),
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
}));
