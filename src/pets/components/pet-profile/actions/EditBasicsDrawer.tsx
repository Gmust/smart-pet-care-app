import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { PetResponseDto } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { BASICS_SEGMENTS } from "@/pets/constants";
import { useUpdatePetMutation } from "@/pets/queries/useUpdatePetMutation";
import { type EditBasicsForm, editBasicsSchema } from "@/pets/schemas/edit-basics.schema";
import { buildBasicsPatch } from "@/pets/utils/buildBasicsPatch";
import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Drawer,
  DRAWER_FOOTER_FADE_SPACING,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerKeyboardDismiss,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

type Props = DialogHandler & {
  pet: PetResponseDto;
};

export const EditBasicsDrawer = ({ isOpen, setIsOpen, pet }: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const { mutateAsync: updatePet, isPending: isPetUpdating } = useUpdatePetMutation();

  const defaultValues = useMemo(
    (): EditBasicsForm => ({
      allergies: pet.allergies?.length ? pet.allergies : [""],
      chronicConditions: pet.chronicConditions?.length ? pet.chronicConditions : [""],
      behavioralNotes: pet.behavioralNotes?.length ? pet.behavioralNotes : [""],
    }),
    [pet]
  );

  const form = useForm({
    defaultValues,
    validators: { onChange: editBasicsSchema, onSubmit: editBasicsSchema },
    onSubmit: async ({ value }) => {
      if (!pet.id) {
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
        return;
      }

      try {
        const payload = buildBasicsPatch(value, pet);
        if (Object.keys(payload).length > 0) {
          await updatePet({ id: pet.id, payload });
        }
        Toast.show({ type: "success", text1: t("pets:updateSuccessMessage") });
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        setApiFieldErrors(form, e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
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
        snapPoints={["85%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerKeyboardDismiss>
          <DrawerHeader style={styles.header}>
            <DrawerTitle>{t("pets:editBasicsDrawer.title")}</DrawerTitle>
          </DrawerHeader>

          <DrawerScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator
          >
            {BASICS_SEGMENTS.map((segment) => (
              <form.Field key={segment} name={segment} mode="array">
                {(field) => (
                  <View style={styles.field}>
                    <Text variant="bodyS" style={styles.label}>
                      {t(`pets:petProfilePage.basics.segments.${segment}`)}
                    </Text>
                    {field.state.value.map((_, index) => (
                      <form.Field key={index} name={`${segment}[${index}]`}>
                        {(itemField) => (
                          <Input
                            placeholder={t(`pets:editBasicsDrawer.placeholders.${segment}`)}
                            value={itemField.state.value}
                            onChangeText={itemField.handleChange}
                            onBlur={itemField.handleBlur}
                            error={itemField.state.meta.errors.length > 0}
                            rightSlot={
                              <Button
                                variant="dangerText"
                                size="sm"
                                accessibilityLabel={t("pets:editBasicsDrawer.removeItem")}
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
                      {t("pets:editBasicsDrawer.addItem")}
                    </Button>
                    <FieldError errors={field.state.meta.errors} />
                  </View>
                )}
              </form.Field>
            ))}
          </DrawerScrollView>
        </DrawerKeyboardDismiss>

        <DrawerFooter style={styles.footer}>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isPetUpdating}
                isLoading={isSubmitting || isPetUpdating}
                onPress={() => form.handleSubmit()}
              >
                {t("pets:editBasicsDrawer.submit")}
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
    color: theme.palette.brand.textSecondary,
  },
  footer: {
    paddingTop: theme.spacing(2),
    backgroundColor: theme.palette.transparent,
  },
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
