import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import { SectionHeader } from "@/common/components/SectionHeader";
import { Button } from "@/shadecn/ui/button";
import { ListCard } from "@/shadecn/ui/card";

import { useNotesQuery } from "../../queries/notes/useNotesQuery";
import type { usePetQuery } from "../../queries/usePetQuery";
import { InfoRow } from "../pet-profile/InfoRow";

import { NotesCard } from "./NotesCard";

type Pet = NonNullable<ReturnType<typeof usePetQuery>["data"]>;

type Props = {
  pet: Pet;
};

export const OverviewTabContent = ({ pet }: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const router = useRouter();

  const { data: notes = [] } = useNotesQuery(pet.id);

  const birthDate = pet.birthDate ? dayjs(pet.birthDate) : null;
  const birthdayValue = birthDate?.isValid()
    ? birthDate.format("MMM D, YYYY")
    : t("petProfilePage.fallbacks.notAdded");

  const weightValue = !pet.weightKg
    ? t("petProfilePage.fallbacks.notAdded")
    : t("petProfilePage.weightValue", { value: pet.weightKg });

  const openNote = (noteId?: string) =>
    router.push({
      pathname: "/(tabs)/pets/note",
      params: noteId ? { petId: pet.id ?? "", noteId } : { petId: pet.id ?? "" },
    });

  return (
    <>
      <SectionHeader label={t("petProfilePage.basics.title")} />
      <ListCard style={styles.listCard}>
        <InfoRow
          label={t("petProfilePage.basics.species")}
          value={pet.species ?? t("petProfilePage.fallbacks.speciesUnknown")}
        />
        <InfoRow
          label={t("petProfilePage.basics.breed")}
          value={pet.breed ?? t("petProfilePage.fallbacks.breedUnknown")}
        />
        <InfoRow label={t("petProfilePage.basics.birthday")} value={birthdayValue} />
        <InfoRow label={t("petProfilePage.basics.sex")} value={pet.sex ?? t("sex.Unknown")} />
        <InfoRow label={t("petProfilePage.basics.weight")} value={weightValue} />
      </ListCard>

      <View style={styles.notesHeader}>
        <View style={styles.notesLabelRow}>
          <SectionHeader label={t("petProfilePage.notes.title")} compact />
        </View>
        <Button
          variant="text"
          size="hug"
          accessibilityLabel={t("petProfilePage.notes.addNoteA11y")}
          textStyle={styles.addText}
          onPress={() => openNote()}
        >
          {t("petProfilePage.notes.addNote")}
        </Button>
      </View>

      <NotesCard notes={notes} onOpenNote={openNote} />
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
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
  addText: {
    ...theme.textStyles.bodySemiBold,
    color: theme.palette.brand.primaryDefault,
  },
}));
