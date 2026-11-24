import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { InfoHint } from "@/common/components/InfoHint";
import { CrossIcon } from "@/icons/cross";
import { PlusIcon } from "@/icons/plus";
import type { CreatePetFormApi } from "@/pets/hooks/useCreatePetForm";
import { Button } from "@/shadecn/ui/button";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

type HealthListName = "allergies" | "chronicConditions" | "behavioralNotes";

type HealthListFieldProps = {
  form: CreatePetFormApi;
  name: HealthListName;
};

export const HealthListField = ({ form, name }: HealthListFieldProps) => {
  const { t } = useTranslation(["pets"]);
  const { theme } = useUnistyles();

  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const label = t(`pets:createPetDrawer.fields.${name}`);

  return (
    <form.Field name={name} mode="array">
      {(field) => (
        <View style={styles.group}>
          <View style={styles.labelRow}>
            <Text variant="bodyS" style={styles.label}>
              {label}
            </Text>
            <InfoHint
              text={t(`pets:createPetDrawer.hints.${name}`)}
              accessibilityLabel={t("pets:createPetDrawer.infoLabel", { field: label })}
            />
          </View>

          {field.state.value.map((_, index) => (
            <form.Field key={index} name={`${name}[${index}]`}>
              {(itemField) => (
                <Input
                  autoFocus={index === focusIndex}
                  placeholder={t(`pets:createPetDrawer.placeholders.${name}`)}
                  value={itemField.state.value}
                  onChangeText={itemField.handleChange}
                  // Rows are keyed by index, so removing one on blur (when "Add" moves the focus) shifts
                  // the new row away. Blank rows are dropped when the form is submitted.
                  onBlur={itemField.handleBlur}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  rightSlot={
                    <Button
                      variant="text"
                      size="hug"
                      accessibilityLabel={t(`pets:createPetDrawer.removeItem.${name}`)}
                      hitSlop={(theme.minTouchTarget - theme.iconSize.md) / 2}
                      icon={
                        <CrossIcon
                          width={theme.iconSize.md}
                          height={theme.iconSize.md}
                          color={theme.palette.brand.danger}
                        />
                      }
                      onPress={() => field.removeValue(index)}
                    />
                  }
                />
              )}
            </form.Field>
          ))}

          <Button
            variant="text"
            size="inline"
            style={styles.add}
            icon={
              <PlusIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={theme.palette.brand.primaryDefault}
              />
            }
            onPress={() => {
              setFocusIndex(field.state.value.length);
              field.pushValue("");
            }}
          >
            {t(`pets:createPetDrawer.add.${name}`)}
          </Button>
        </View>
      )}
    </form.Field>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.spacing(2),
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  add: {
    alignSelf: "flex-start",
  },
}));
