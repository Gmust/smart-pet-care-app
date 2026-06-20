import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { Chevron } from "@/icons/arrows";
import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { EditPetDrawer } from "../components/EditPetDrawer";
import { FlagChip } from "../components/FlagChip";
import { InfoRow } from "../components/InfoRow";
import { NoteRow } from "../components/NoteRow";
import { PetProfilePageActions } from "../components/PetProfilePageActions";
import { PetSpeciesImage } from "../components/PetSpeciesImage";
import { RoundButton } from "../components/RoundButton";
import { SectionHeader } from "../components/SectionHeader";
import useDeletePetMutation from "../queries/useDeletePet";
import { usePetQuery } from "../queries/usePetQuery";
import {
  PetProfileHeroSkeleton,
  PetProfilePageSkeleton,
} from "../skeletons/PetProfilePageSkeleton";
import type { PetFlag, PetNote } from "../types";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "Not added";
  }

  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY") : value;
};

const formatWeight = (pet: PetResponseDto): string => {
  if (pet.weightKg === null || pet.weightKg === undefined) {
    return "Not added";
  }

  return `${pet.weightKg} kg`;
};

const getFlags = (pet: PetResponseDto): PetFlag[] => {
  const flags: PetFlag[] = [];

  if (pet.allergies) {
    flags.push({ id: "allergies", label: "Allergies", tone: "warn" });
  }

  if (pet.chronicConditions) {
    flags.push({ id: "chronic-conditions", label: "Chronic condition", tone: "warn" });
  }

  if (!flags.length && pet.species) {
    flags.push({ id: "species", label: pet.species, tone: "ok" });
  }

  return flags;
};

const getNotes = (pet: PetResponseDto): PetNote[] => {
  const notes: PetNote[] = [];

  if (pet.allergies) {
    notes.push({ id: "allergies", title: "Allergies", preview: pet.allergies });
  }

  if (pet.chronicConditions) {
    notes.push({
      id: "chronic-conditions",
      title: "Chronic conditions",
      preview: pet.chronicConditions,
    });
  }

  if (pet.behavioralNotes) {
    notes.push({ id: "behavioral-notes", title: "Behavioral notes", preview: pet.behavioralNotes });
  }

  return notes;
};

export default function PetProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["pets", "common"]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pet, isLoading: isPetLoading } = usePetQuery(petId);
  const { mutateAsync: deletePet, isPending: isPetDeleting } = useDeletePetMutation();
  const petName = pet?.name;
  const flags = pet ? getFlags(pet) : [];
  const notes = pet ? getNotes(pet) : [];

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

  const handleDeletePet = async () => {
    if (!pet?.id) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }

    try {
      await deletePet(pet.id);
      Toast.show({ type: "success", text1: t("pets:deleteSuccessMessage") });
      setIsDeleteDialogOpen(false);
      router.replace("/(tabs)/pets");
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <RoundButton accessibilityLabel="Go back" onPress={handleBack}>
          <Chevron width={9} height={16} color={palette.brand.textBody} />
        </RoundButton>
        <Text style={styles.topBarTitle}>{petName}</Text>
        <PetProfilePageActions
          disabled={!pet}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDeleteDialog}
        />
      </View>

      {!!pet && <EditPetDrawer pet={pet} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pets:petProfilePage.deleteDialog.title")}</DialogTitle>
            <DialogDescription style={styles.deleteDialogDescription}>
              {t("pets:petProfilePage.deleteDialog.description", { name: petName })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="danger"
              size="md"
              isLoading={isPetDeleting}
              disabled={isPetDeleting}
              onPress={handleDeletePet}
            >
              {t("pets:petProfilePage.deleteDialog.confirm")}
            </Button>

            <DialogClose asChild>
              <Button variant="ghost" size="md" disabled={isPetDeleting}>
                {t("pets:petProfilePage.deleteDialog.cancel")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPetLoading ? (
        <View style={styles.hero}>
          <PetProfileHeroSkeleton />
        </View>
      ) : pet ? (
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
          <Text style={styles.emptyText}>{isPetLoading ? "Loading pet" : "Pet not found"}</Text>
        </View>
      )}

      <View style={styles.segmentedTabs}>
        {["Overview", "Activity", "Health", "Reminders"].map((label, index) => (
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
        {isPetLoading && <PetProfilePageSkeleton />}

        {!!pet && (
          <>
            <SectionHeader label="Basics" />
            <View style={styles.listCard}>
              <InfoRow label="Species" value={pet.species ?? "Unknown"} />
              <InfoRow label="Breed" value={pet.breed ?? "Breed unknown"} />
              <InfoRow label="Birthday" value={formatDate(pet.birthDate)} />
              <InfoRow label="Sex" value={pet.sex ?? "Unknown"} />
              <InfoRow label="Weight" value={formatWeight(pet)} />
            </View>
          </>
        )}

        {!isPetLoading && (
          <View style={styles.notesHeader}>
            <View style={styles.notesLabelRow}>
              <SectionHeader label="Notes" compact />
              <CirclePlusIcon width={20} height={20} color={palette.brand.textSecondary} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Manage notes">
              <Text style={styles.manageText}>Manage</Text>
            </Pressable>
          </View>
        )}

        {!!pet && (
          <View style={styles.listCard}>
            {notes.length ? (
              notes.map((note) => <NoteRow key={note.id} note={note} />)
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No notes yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
  deleteDialogDescription: {
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.45,
    color: theme.palette.brand.textBody,
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
