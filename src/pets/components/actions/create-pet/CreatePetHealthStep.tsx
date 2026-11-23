import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { CreatePetFormApi } from "@/pets/hooks/useCreatePetForm";
import { Text } from "@/shadecn/ui/text";

import { HealthListField } from "./HealthListField";

export const CreatePetHealthStep = ({ form }: { form: CreatePetFormApi }) => {
  const { t } = useTranslation(["pets"]);

  return (
    <View style={styles.stack}>
      <View style={styles.intro}>
        <Text variant="bodyS" style={styles.introText}>
          {t("pets:createPetDrawer.intro.prefix")}
          <Text variant="bodyS" style={styles.introHighlight}>
            {t("pets:createPetDrawer.intro.highlight")}
          </Text>
          {t("pets:createPetDrawer.intro.suffix")}
        </Text>
      </View>

      <HealthListField form={form} name="allergies" />
      <HealthListField form={form} name="chronicConditions" />
      <HealthListField form={form} name="behavioralNotes" />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(6),
  },
  intro: {
    justifyContent: "center",
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(2.75),
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.peachTint,
  },
  introText: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  introHighlight: {
    color: theme.palette.brand.peachDefault,
  },
}));
