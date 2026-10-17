import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { ClassifierWellnessBand } from "@/api/generated";
import { TriangleAlertIcon } from "@/icons/alert";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";
import { useWellnessQuery } from "@/wellness/queries/useWellnessQuery";

import { PetSpeciesImage } from "../PetSpeciesImage";

type BandTone = "ok" | "warn" | "danger";

const BAND_TONE: Record<ClassifierWellnessBand, BandTone> = {
  [ClassifierWellnessBand.EXCELLENT]: "ok",
  [ClassifierWellnessBand.GOOD]: "ok",
  [ClassifierWellnessBand.FAIR]: "warn",
  [ClassifierWellnessBand.CONCERNING]: "warn",
  [ClassifierWellnessBand.CRITICAL]: "danger",
};

type AssessmentHeroProps = {
  pet: PetResponseDto;
};

export const AssessmentHero = ({ pet }: AssessmentHeroProps) => {
  const { t } = useTranslation(["wellness"]);

  const { data: wellness } = useWellnessQuery(pet.id);

  const band = wellness?.band;
  const tone = band ? BAND_TONE[band] : null;

  return (
    <View style={styles.root}>
      <View style={styles.photo}>
        <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} />
      </View>

      <Text variant="titleM" style={styles.name} numberOfLines={1}>
        {pet.name}
      </Text>

      {!!band && !!tone && (
        <Chip
          variant="onDark"
          tone={tone}
          label={t(`wellness:band.${band}`)}
          icon={tone === "ok" ? undefined : TriangleAlertIcon}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3.5),
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.brand.peachDefault,
  },
  photo: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.peachMid,
    borderRadius: theme.borderRadius.full,
  },
  name: {
    flex: 1,
    minWidth: 0,
    color: theme.palette.brand.textOnDark,
  },
}));
