import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { CirclePlusIcon } from "@/icons/circle-plus";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { usePetQuery } from "../../queries/usePetQuery";
import type { PetNote } from "../../types";
import { InfoRow } from "../pet-profile/InfoRow";
import { NoteRow } from "../pet-profile/NoteRow";
import { SectionHeader } from "../pet-profile/SectionHeader";
import dayjs from "dayjs";

type Pet = NonNullable<ReturnType<typeof usePetQuery>["data"]>;

type Props = {
  pet: Pet;
};

export function OverviewTabContent({ pet }: Props) {
  const { t } = useTranslation(["pets", "common"]);

  const notes: PetNote[] = [];
  const allergiesText = (pet.allergies ?? []).filter(Boolean).join(", ");
  if (allergiesText) {
    notes.push({
      id: "allergies",
      title: t("petProfilePage.flags.allergies"),
      preview: allergiesText,
    });
  }

  const chronicConditionsText = (pet.chronicConditions ?? []).filter(Boolean).join(", ");
  if (chronicConditionsText) {
    notes.push({
      id: "chronic-conditions",
      title: t("petProfilePage.noteTitles.chronicConditions"),
      preview: chronicConditionsText,
    });
  }

  const behavioralNotesText = (pet.behavioralNotes ?? []).filter(Boolean).join(", ");
  if (behavioralNotesText) {
    notes.push({
      id: "behavioral-notes",
      title: t("petProfilePage.noteTitles.behavioralNotes"),
      preview: behavioralNotesText,
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("petProfilePage.notes.manageA11y")}
        >
          <Text variant="bodySemiBold" style={styles.manageText}>
            {t("petProfilePage.notes.manage")}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listCard}>
        {notes.length ? (
          notes.map((note) => <NoteRow key={note.id} note={note} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text variant="body" style={styles.emptyText}>
              {t("petProfilePage.notes.empty")}
            </Text>
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
    color: theme.palette.brand.primaryDefault,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(5),
  },
  emptyText: {
    color: theme.palette.brand.textSecondary,
  },
}));
