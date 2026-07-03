import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { usePetQuery } from "../../queries/usePetQuery";
import type { PetNote } from "../../types";
import { InfoRow } from "../InfoRow";
import { NoteRow } from "../NoteRow";
import { SectionHeader } from "../SectionHeader";
import dayjs from "dayjs";

type Pet = NonNullable<ReturnType<typeof usePetQuery>["data"]>;

type Props = {
  pet: Pet;
};

export function OverviewTabContent({ pet }: Props) {
  const { t } = useTranslation(["pets", "common"]);

  const notes: PetNote[] = [];
  if (pet.allergies) {
    notes.push({
      id: "allergies",
      title: t("petProfilePage.flags.allergies"),
      preview: pet.allergies,
    });
  }
  if (pet.chronicConditions) {
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

  const birthDate = pet.birthDate ? dayjs(pet.birthDate) : null;
  const birthdayValue = birthDate?.isValid()
    ? birthDate.format("MMM D, YYYY")
    : t("petProfilePage.fallbacks.notAdded");

  const weightValue = !pet.weightKg
    ? t("petProfilePage.fallbacks.notAdded")
    : t("petProfilePage.weightValue", { value: pet.weightKg });

  return (
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
        <InfoRow label={t("petProfilePage.basics.sex")} value={pet.sex ?? t("sex.Unknown")} />
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
  );
}

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
