import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { AnimalSpecies, type PetResponseDto, Sex } from "@/api/generated";
import { DateTimeField } from "@/common/components/DateTimeField";
import { useUpdatePetMutation } from "@/pets/queries/useUpdatePetMutation";
import type { CreatePetForm } from "@/pets/schemas/create-pet.schema";
import { createPetSchema } from "@/pets/schemas/create-pet.schema";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DRAWER_FOOTER_FADE_SPACING,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { Text } from "@/shadecn/ui/text";

import dayjs from "dayjs";

type Props = {
  isOpen: boolean;
  pet: PetResponseDto;
  setIsOpen: (open: boolean) => void;
};

const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"] as const;
const SEX_OPTIONS: Sex[] = [Sex.Unknown, Sex.Male, Sex.Female];
const SELECT_PORTAL_HOST = "select";

const getPetFormValues = (pet: PetResponseDto): CreatePetForm => ({
  name: pet.name ?? "",
  species: pet.species ?? "",
  breed: pet.breed ?? "",
  birthDate: pet.birthDate ?? null,
  weightKg: pet.weightKg !== null && pet.weightKg !== undefined ? String(pet.weightKg) : "",
  sex: pet.sex ?? Sex.Unknown,
  allergies: pet.allergies?.length ? pet.allergies : [""],
  chronicConditions: pet.chronicConditions?.length ? pet.chronicConditions : [""],
  behavioralNotes: pet.behavioralNotes?.length ? pet.behavioralNotes : [""],
});

export const EditPetDrawer = ({ isOpen, pet, setIsOpen }: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const { mutateAsync: updatePet, isPending: isPetUpdating } = useUpdatePetMutation();

  const defaultValues = useMemo(() => getPetFormValues(pet), [pet]);

  const speciesLabel = (value: string) => {
    const known = SPECIES.find((species) => species === value);
    return known ? t(`pets:species.${known}`) : value;
  };

  const form = useForm({
    defaultValues,
    validators: { onChange: createPetSchema(t), onSubmit: createPetSchema(t) },
    onSubmit: async ({ value }) => {
      if (!pet.id) {
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
        return;
      }

      try {
        const species = Object.values(AnimalSpecies).find(
          (animalSpecies) => animalSpecies === value.species
        );
        if (!species) {
          Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
          return;
        }

        await updatePet({
          id: pet.id,
          payload: {
            name: value.name,
            species,
            breed: value.breed,
            birthDate: value.birthDate,
            sex: value.sex,
            allergies: value.allergies,
            chronicConditions: value.chronicConditions,
            behavioralNotes: value.behavioralNotes,
          },
        });
        Toast.show({ type: "success", text1: t("pets:updateSuccessMessage") });
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["95%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("pets:editPetDrawer.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="name">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("pets:createPetDrawer.fields.name")}
                  placeholder={t("pets:createPetDrawer.placeholders.name")}
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="species">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("pets:createPetDrawer.fields.species")}</Text>
                <Select
                  containerStyle={styles.selectContainer}
                  value={
                    field.state.value
                      ? { value: field.state.value, label: speciesLabel(field.state.value) }
                      : undefined
                  }
                  onValueChange={(option) => field.handleChange(option?.value ?? "")}
                >
                  <SelectTrigger style={styles.selectTrigger}>
                    <SelectValue placeholder={t("pets:createPetDrawer.placeholders.species")} />
                  </SelectTrigger>
                  <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                    {SPECIES.map((species) => (
                      <SelectItem
                        key={species}
                        value={species}
                        label={t(`pets:species.${species}`)}
                      />
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="breed">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("pets:createPetDrawer.fields.breed")}
                  placeholder={t("pets:createPetDrawer.placeholders.breed")}
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="sex">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("pets:createPetDrawer.fields.sex")}</Text>
                <Select
                  containerStyle={styles.selectContainer}
                  value={{
                    value: field.state.value ?? Sex.Unknown,
                    label: t(`pets:sex.${field.state.value ?? Sex.Unknown}`),
                  }}
                  onValueChange={(option) => {
                    const next = SEX_OPTIONS.find((sex) => sex === option?.value);
                    if (next) field.handleChange(next);
                  }}
                >
                  <SelectTrigger style={styles.selectTrigger}>
                    <SelectValue placeholder={t("pets:createPetDrawer.placeholders.sex")} />
                  </SelectTrigger>
                  <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                    {SEX_OPTIONS.map((sex) => (
                      <SelectItem key={sex} value={sex} label={t(`pets:sex.${sex}`)} />
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="birthDate">
            {(field) => (
              <View style={styles.field}>
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
              </View>
            )}
          </form.Field>

          <form.Field name="weightKg">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("pets:createPetDrawer.fields.weight")}
                  placeholder={t("pets:createPetDrawer.placeholders.weight")}
                  keyboardType="decimal-pad"
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="allergies" mode="array">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("pets:createPetDrawer.fields.allergies")}</Text>
                {field.state.value.map((_, index) => (
                  <form.Field key={index} name={`allergies[${index}]`}>
                    {(itemField) => (
                      <Input
                        placeholder={t("pets:createPetDrawer.placeholders.allergies")}
                        value={itemField.state.value}
                        onChangeText={itemField.handleChange}
                        onBlur={itemField.handleBlur}
                        error={itemField.state.meta.errors.length > 0}
                        rightSlot={
                          <Button
                            variant="text"
                            size="sm"
                            accessibilityLabel={t("pets:createPetDrawer.removeAllergy")}
                            onPress={() => field.removeValue(index)}
                          >
                            {t("pets:createPetDrawer.remove")}
                          </Button>
                        }
                      />
                    )}
                  </form.Field>
                ))}
                <Button variant="ghost" size="sm" dotted onPress={() => field.pushValue("")}>
                  {t("pets:createPetDrawer.addAllergy")}
                </Button>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="chronicConditions" mode="array">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("pets:createPetDrawer.fields.chronicConditions")}
                </Text>
                {field.state.value.map((_, index) => (
                  <form.Field key={index} name={`chronicConditions[${index}]`}>
                    {(itemField) => (
                      <Input
                        placeholder={t("pets:createPetDrawer.placeholders.chronicConditions")}
                        value={itemField.state.value}
                        onChangeText={itemField.handleChange}
                        onBlur={itemField.handleBlur}
                        error={itemField.state.meta.errors.length > 0}
                        rightSlot={
                          <Button
                            variant="text"
                            size="sm"
                            accessibilityLabel={t("pets:createPetDrawer.removeChronicCondition")}
                            onPress={() => field.removeValue(index)}
                          >
                            {t("pets:createPetDrawer.remove")}
                          </Button>
                        }
                      />
                    )}
                  </form.Field>
                ))}
                <Button variant="ghost" size="sm" dotted onPress={() => field.pushValue("")}>
                  {t("pets:createPetDrawer.addChronicCondition")}
                </Button>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="behavioralNotes" mode="array">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("pets:createPetDrawer.fields.behavioralNotes")}</Text>
                {field.state.value.map((_, index) => (
                  <form.Field key={index} name={`behavioralNotes[${index}]`}>
                    {(itemField) => (
                      <Input
                        placeholder={t("pets:createPetDrawer.placeholders.behavioralNotes")}
                        value={itemField.state.value}
                        onChangeText={itemField.handleChange}
                        onBlur={itemField.handleBlur}
                        error={itemField.state.meta.errors.length > 0}
                        rightSlot={
                          <Button
                            variant="text"
                            size="sm"
                            accessibilityLabel={t("pets:createPetDrawer.removeBehavioralNote")}
                            onPress={() => field.removeValue(index)}
                          >
                            {t("pets:createPetDrawer.remove")}
                          </Button>
                        }
                      />
                    )}
                  </form.Field>
                ))}
                <Button variant="ghost" size="sm" dotted onPress={() => field.pushValue("")}>
                  {t("pets:createPetDrawer.addBehavioralNote")}
                </Button>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>
        </DrawerScrollView>

        <DrawerFooter style={styles.footer}>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                size="lg"
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isPetUpdating}
                isLoading={isSubmitting || isPetUpdating}
                onPress={() => form.handleSubmit()}
              >
                {t("pets:editPetDrawer.submit")}
              </Button>
            )}
          </form.Subscribe>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(1),
  },
  title: {
    fontSize: theme.fontSize.xl,
    letterSpacing: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(DRAWER_FOOTER_FADE_SPACING),
  },
  field: {
    gap: theme.spacing(1.5),
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  selectContainer: {
    alignSelf: "stretch",
  },
  selectTrigger: {
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    backgroundColor: "transparent",
  },
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
