import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Sex } from "@/api/generated";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

const SEX_OPTIONS: Sex[] = [Sex.Female, Sex.Male, Sex.Unknown];

type SexChipsProps = {
  value: Sex;
  onChange: (sex: Sex) => void;
};

export const SexChips = ({ value, onChange }: SexChipsProps) => {
  const { t } = useTranslation(["pets"]);

  return (
    <View style={styles.group}>
      <Text variant="bodyS" style={styles.label}>
        {t("pets:createPetDrawer.fields.sex")}
      </Text>
      <View style={styles.options}>
        {SEX_OPTIONS.map((sex) => (
          <Chip
            key={sex}
            label={t(`pets:sex.${sex}`)}
            selected={sex === value}
            variant={sex === value ? "default" : "ghost"}
            tone={sex === value ? "primary" : "neutral"}
            onPress={() => onChange(sex)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.spacing(2),
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  options: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
}));
