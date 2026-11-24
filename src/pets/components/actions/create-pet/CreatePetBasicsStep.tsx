import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { Sex } from "@/api/generated";
import { DateTimeField } from "@/common/components/DateTimeField";
import type { CreatePetFormApi } from "@/pets/hooks/useCreatePetForm";
import { FieldError } from "@/shadecn/ui/field-error";

import { FormInputField } from "./FormInputField";
import { SexChips } from "./SexChips";
import { SpeciesField } from "./SpeciesField";

export const CreatePetBasicsStep = ({ form }: { form: CreatePetFormApi }) => {
  const { t } = useTranslation(["pets"]);

  return (
    <View style={styles.stack}>
      <form.Field name="name">
        {(field) => (
          <FormInputField
            field={field}
            label={t("pets:createPetDrawer.fields.name")}
            placeholder={t("pets:createPetDrawer.placeholders.name")}
          />
        )}
      </form.Field>

      <form.Field name="species">{(field) => <SpeciesField field={field} />}</form.Field>

      <View style={styles.row}>
        <View style={styles.half}>
          <form.Field name="weightKg">
            {(field) => (
              <FormInputField
                field={field}
                label={t("pets:createPetDrawer.fields.weight")}
                placeholder={t("pets:createPetDrawer.placeholders.weight")}
                keyboardType="decimal-pad"
              />
            )}
          </form.Field>
        </View>
        <View style={styles.half}>
          <form.Field name="birthDate">
            {(field) => (
              <>
                <DateTimeField
                  mode="date"
                  label={t("pets:createPetDrawer.fields.birthDate")}
                  placeholder={t("pets:createPetDrawer.placeholders.birthDate")}
                  value={field.state.value ? new Date(field.state.value) : null}
                  display={(date) => dayjs(date).format("MMM D, YYYY")}
                  maximumDate={new Date()}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(date.toISOString())}
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </>
            )}
          </form.Field>
        </View>
      </View>

      <form.Field name="breed">
        {(field) => (
          <FormInputField
            field={field}
            label={t("pets:createPetDrawer.fields.breed")}
            placeholder={t("pets:createPetDrawer.placeholders.breed")}
          />
        )}
      </form.Field>

      <form.Field name="sex">
        {(field) => (
          <SexChips value={field.state.value ?? Sex.Unknown} onChange={field.handleChange} />
        )}
      </form.Field>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(4),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(3),
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
}));
