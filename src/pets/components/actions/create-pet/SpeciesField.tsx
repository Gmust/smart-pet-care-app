import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { AnyFieldApi } from "@tanstack/react-form";

import { useVisibleFieldErrors } from "@/common/hooks/useVisibleFieldErrors";
import { getFirstFieldError } from "@/common/utils/getFirstFieldError";
import { PET_SPECIES } from "@/pets/constants";
import { useSpeciesLabel } from "@/pets/hooks/useSpeciesLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { Text } from "@/shadecn/ui/text";

const SELECT_PORTAL_HOST = "select";

export const SpeciesField = ({ field }: { field: AnyFieldApi }) => {
  const { t } = useTranslation(["pets"]);
  const speciesLabel = useSpeciesLabel();
  const errors = useVisibleFieldErrors(field);

  const message = getFirstFieldError(errors);
  const selected: string = field.state.value;

  return (
    <View style={styles.field}>
      <Text variant="bodyS" style={[styles.label, !!message && styles.labelError]}>
        {t("pets:createPetDrawer.fields.species")}
      </Text>
      <Select
        containerStyle={styles.selectContainer}
        value={selected ? { value: selected, label: speciesLabel(selected) } : undefined}
        onValueChange={(option) => field.handleChange(option?.value ?? "")}
        onOpenChange={(open) => {
          if (!open) field.handleBlur();
        }}
      >
        <SelectTrigger
          // Opening the list takes the focus (and the keyboard) away from a field being typed in.
          onPressIn={Keyboard.dismiss}
          style={[
            styles.trigger,
            !selected && styles.triggerEmpty,
            !!message && styles.triggerError,
          ]}
        >
          <SelectValue placeholder={t("pets:createPetDrawer.placeholders.species")} />
        </SelectTrigger>
        <SelectContent portalHost={SELECT_PORTAL_HOST}>
          {PET_SPECIES.map((species) => (
            <SelectItem key={species} value={species} label={speciesLabel(species)} />
          ))}
        </SelectContent>
      </Select>
      {!!message && (
        <Text variant="caption" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1),
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  labelError: {
    color: theme.palette.brand.danger,
  },
  selectContainer: {
    alignSelf: "stretch",
  },
  trigger: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    minHeight: theme.spacing(13),
    paddingLeft: theme.spacing(3.5),
    paddingRight: theme.spacing(3.5),
    borderWidth: theme.spacing(0.375),
  },
  triggerEmpty: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  triggerError: {
    backgroundColor: theme.palette.brand.dangerBg,
    borderColor: theme.palette.brand.danger,
  },
  message: {
    color: theme.palette.brand.danger,
  },
}));
