import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Chevron } from "@/icons/arrows";
import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { DeletePetConfirmation } from "../components/actions/DeletePetConfirmation";
import { EditPetDrawer } from "../components/actions/EditPetDrawer";
import { PetProfilePageActions } from "../components/actions/PetProfilePageActions";
import { UploadPetPhotoDrawer } from "../components/actions/UploadPetPhotoDrawer";
import { FlagChip } from "../components/FlagChip";
import { InfoRow } from "../components/InfoRow";
import { NoteRow } from "../components/NoteRow";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { SectionHeader } from "../components/SectionHeader";
import { usePetQuery } from "../queries/usePetQuery";
import { PetProfilePageSkeleton } from "../skeletons/PetProfilePageSkeleton";
import type { PetFlag, PetNote } from "../types";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PetProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["pets", "common"]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pet, isLoading: isPetLoading } = usePetQuery(petId);
  const petName = pet?.name;

  const tabs = [
    t("petProfilePage.tabs.overview"),
    t("petProfilePage.tabs.activity"),
    t("petProfilePage.tabs.health"),
    t("petProfilePage.tabs.reminders"),
  ];

  const flags: PetFlag[] = [];
  const notes: PetNote[] = [];
  if (pet) {
    if (pet.allergies) {
      flags.push({ id: "allergies", label: t("petProfilePage.flags.allergies"), tone: "warn" });
      notes.push({
        id: "allergies",
        title: t("petProfilePage.flags.allergies"),
        preview: pet.allergies,
      });
    }
    if (pet.chronicConditions) {
      flags.push({
        id: "chronic-conditions",
        label: t("petProfilePage.flags.chronicCondition"),
        tone: "warn",
      });
      notes.push({
        id: "chronic-conditions",
        title: t("petProfilePage.noteTitles.chronicConditions"),
        preview: pet.chronicConditions,
      });
    }
    if (pet.behavioralNotes) {
      notes.push({
        id: "behavioral-notes",
        title: t("petProfilePage.noteTitles.behavioralNotes"),
        preview: pet.behavioralNotes,
      });
    }
    if (!flags.length && pet.species) {
      flags.push({ id: "species", label: pet.species, tone: "ok" });
    }
  }

  const birthDate = pet?.birthDate ? dayjs(pet.birthDate) : null;
  const birthdayValue = birthDate?.isValid()
    ? birthDate.format("MMM D, YYYY")
    : t("petProfilePage.fallbacks.notAdded");

  const weightValue = !pet?.weightKg
    ? t("petProfilePage.fallbacks.notAdded")
    : t("petProfilePage.weightValue", { value: pet?.weightKg });

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
            <Chevron width={9} height={16} color={palette.brand.textBody} />
          </Button>
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
          </View>
        ) : (
          <View style={[styles.hero, styles.heroEmpty]}>
            <Text style={styles.emptyText}>{t("petProfilePage.notFound")}</Text>
          </View>
        )}

        <View style={styles.segmentedTabs}>
          {tabs.map((label, index) => (
            <View key={label} style={[styles.segmentTab, index === 0 && styles.segmentTabActive]}>
              <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          {!!pet && (
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

              <View style={styles.listCard}>
                {notes.length ? (
                  notes.map((note) => <NoteRow key={note.id} note={note} />)
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>{t("petProfilePage.notes.empty")}</Text>
                  </View>
                )}
              </View>
            </>
          )}
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
    padding: theme.spacing(2.5),
  },
  segmentTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.palette.brand.primaryDefault,
  },
  segmentText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    color: theme.palette.brand.textSecondary,
  },
  segmentTextActive: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.primaryDefault,
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
