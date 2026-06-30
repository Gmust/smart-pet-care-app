import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { ImagePicker, type ImagePickerValue } from "@/common/components/ImagePicker";
import { useUploadPetPhoto } from "@/pets/queries/useUploadPetPhoto";
import { uploadPetPhotoSchema } from "@/pets/schemas/upload-pet-photo.schema";
import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";

type Props = DialogHandler & {
  petId: string;
};

const defaultValues: { file: ImagePickerValue | null } = { file: null };

export const UploadPetPhotoDrawer = ({ isOpen, setIsOpen, petId }: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const { mutateAsync: uploadPetPhoto } = useUploadPetPhoto();

  const form = useForm({
    defaultValues,
    validators: { onSubmit: uploadPetPhotoSchema, onChange: uploadPetPhotoSchema },
    onSubmit: async ({ value }) => {
      if (!value.file) return;
      try {
        await uploadPetPhoto({ image: value.file, petId });
        Toast.show({ type: "success", text1: t("uploadPhotoDrawer.successMessage") });
        form.reset();
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
  });

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) form.reset();
        setIsOpen(open);
      }}
    >
      <DrawerContent
        scrollable
        snapPoints={["55%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("uploadPhotoDrawer.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="file">
            {(field) => (
              <ImagePicker
                shape="square"
                aspect={[16, 9]}
                onChange={(value) => field.handleChange(value)}
                value={field.state.value}
              />
            )}
          </form.Field>
        </DrawerScrollView>

        <DrawerFooter>
          <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting, file: s.values.file })}>
            {({ isSubmitting, file }) => (
              <Button
                onPress={form.handleSubmit}
                disabled={!file || isSubmitting}
                isLoading={isSubmitting}
              >
                {t("uploadPhotoDrawer.saveBtn")}
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
    paddingBottom: theme.spacing(20),
  },
}));
