import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { PetResponseDto, UpdatePetDto } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import type { BasicsSegment } from "@/pets/constants";
import { useUpdatePetMutation } from "@/pets/queries/useUpdatePetMutation";
import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerKeyboardDismiss,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Input } from "@/shadecn/ui/input";

type Props = DialogHandler & {
  pet: PetResponseDto;
  segment: BasicsSegment;
};

export const AddBasicsItemDrawer = ({ isOpen, setIsOpen, pet, segment }: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const { mutateAsync: updatePet, isPending: isPetUpdating } = useUpdatePetMutation();

  const form = useForm({
    defaultValues: { text: "" },
    onSubmit: async ({ value }) => {
      // Save is off while the field is blank; Enter on the keyboard is not.
      if (!value.text.trim()) return;

      if (!pet.id) {
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
        return;
      }

      // The API replaces the whole list, so the new item goes after the stored ones.
      const payload: UpdatePetDto = {};
      payload[segment] = [...(pet[segment] ?? []).filter(Boolean), value.text.trim()];

      try {
        await updatePet({ id: pet.id, payload });
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
      form.reset();
    }
  }, [form, isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["75%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerKeyboardDismiss>
          <DrawerHeader style={styles.header}>
            <DrawerTitle>
              {t("pets:addBasicsItemDrawer.title", {
                section: t(`pets:petProfilePage.basics.segments.${segment}`),
              })}
            </DrawerTitle>
          </DrawerHeader>

          <View style={styles.content}>
            <form.Field name="text">
              {(field) => (
                <View style={styles.field}>
                  <Input
                    autoFocus
                    placeholder={t("pets:addBasicsItemDrawer.placeholder")}
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    onSubmitEditing={() => form.handleSubmit()}
                    returnKeyType="done"
                    helperText={t("pets:addBasicsItemDrawer.hint")}
                  />
                </View>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => ({
                text: state.values.text.trim(),
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ text, isSubmitting }) => (
                <Button
                  variant="primary"
                  animateDisabled
                  disabled={!text || isPetUpdating}
                  isLoading={isSubmitting || isPetUpdating}
                  onPress={() => form.handleSubmit()}
                >
                  {t("pets:addBasicsItemDrawer.submit")}
                </Button>
              )}
            </form.Subscribe>
          </View>
        </DrawerKeyboardDismiss>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(1),
  },
  content: {
    gap: theme.spacing(4),
    paddingTop: theme.spacing(3),
  },
  field: {
    gap: theme.spacing(1.5),
  },
}));
