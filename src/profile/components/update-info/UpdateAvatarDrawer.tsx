import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { ImagePicker, type ImagePickerValue } from "@/common/components/ImagePicker";
import { useUpdateAvatar } from "@/profile/queries/useUpdateAvatar";
import { setNewAvatarSchema } from "@/profile/schemas/set-new-avatar.schema";
import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";

type Props = DialogHandler;

const defaultValues: { file: ImagePickerValue | null } = { file: null };

export const UpdateAvatarDrawer = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation(["profile", "common"]);
  const { mutateAsync: updateAvatar } = useUpdateAvatar();

  const form = useForm({
    defaultValues,
    validators: { onSubmit: setNewAvatarSchema, onChange: setNewAvatarSchema },
    onSubmit: async ({ value }) => {
      if (!value.file) return;
      try {
        await updateAvatar(value.file);
        Toast.show({ type: "success", text1: t("setNewAvatarDrawer.successMessage") });
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
      <DrawerContent snapPoints={["48%"]} enableDynamicSizing={false} enablePanDownToClose={false}>
        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("setNewAvatarDrawer.title")}</DrawerTitle>
        </DrawerHeader>

        <View style={styles.content}>
          <form.Field name="file">
            {(field) => (
              <ImagePicker
                onChange={(value) => field.handleChange(value)}
                value={field.state.value}
              />
            )}
          </form.Field>
        </View>

        <DrawerFooter style={styles.footer}>
          <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting, file: s.values.file })}>
            {({ isSubmitting, file }) => (
              <Button
                onPress={form.handleSubmit}
                disabled={!file || isSubmitting}
                isLoading={isSubmitting}
              >
                {t("setNewAvatarDrawer.saveBtn")}
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
  content: {
    gap: theme.spacing(5),
    paddingTop: theme.spacing(3),
  },
  footer: {
    paddingTop: theme.spacing(2),
    backgroundColor: "transparent",
  },
}));
