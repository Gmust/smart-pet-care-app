import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { PatchUserDto } from "@/api/generated";
import { ImagePicker, type ImagePickerValue } from "@/common/components/ImagePicker";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { useProfileAvatar } from "@/profile/hooks/useProfileAvatar";
import { useUpdateAvatar } from "@/profile/queries/useUpdateAvatar";
import { useUpdateProfileMutation } from "@/profile/queries/useUpdateProfileMutation";
import { editProfileSchema } from "@/profile/schemas/edit-profile.schema";
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

import { AvatarPickerPlaceholder } from "./AvatarPickerPlaceholder";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const EditProfileDrawer = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation(["profile", "common"]);
  const { mutateAsync: updateProfile } = useUpdateProfileMutation();
  const { mutateAsync: updateAvatar } = useUpdateAvatar();
  const { data: profile } = useProfileMeQuery();
  const { avatarUrl, initials } = useProfileAvatar();

  // Android closes the drawer while the photo library is open; that close must not wipe the form.
  const isPickingPhotoRef = useRef(false);

  const initialValues: {
    displayName: string;
    phoneNumber: string;
    avatar: ImagePickerValue | null;
  } = {
    displayName: profile?.displayName ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    avatar: null,
  };

  const form = useForm({
    defaultValues: initialValues,
    validators: { onChange: editProfileSchema(t), onSubmit: editProfileSchema(t) },
    onSubmit: async ({ value }) => {
      const patch: PatchUserDto = {};
      if (value.displayName !== initialValues.displayName) {
        patch.displayName = value.displayName || null;
      }
      if (value.phoneNumber !== initialValues.phoneNumber) {
        patch.phoneNumber = value.phoneNumber || null;
      }

      try {
        if (Object.keys(patch).length > 0) await updateProfile(patch);
      } catch (e) {
        console.error(e);
        setApiFieldErrors(form, e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
        return;
      }

      try {
        if (value.avatar) await updateAvatar(value.avatar);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
        return;
      }

      form.reset({ ...value, avatar: null });
      Toast.show({ type: "success", text1: t("profile:updateSuccessMessage") });
      setIsOpen(false);
    },
  });

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPickingPhotoRef.current) form.reset(initialValues);
        setIsOpen(open);
      }}
    >
      <DrawerContent
        scrollable
        snapPoints={["80%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle>{t("profile:editProfileDrawer.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="avatar">
            {(field) => (
              <ImagePicker
                accessibilityLabel={t("profile:editProfileDrawer.changePhoto")}
                placeholder={<AvatarPickerPlaceholder avatarUrl={avatarUrl} initials={initials} />}
                value={field.state.value}
                onChange={field.handleChange}
                onPickStart={() => {
                  isPickingPhotoRef.current = true;
                }}
                onBlur={() => {
                  isPickingPhotoRef.current = false;
                  field.handleBlur();
                }}
              />
            )}
          </form.Field>

          <form.Field name="displayName">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("profile:editProfileDrawer.fields.displayName")}
                  placeholder={t("profile:editProfileDrawer.placeholders.displayName")}
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="phoneNumber">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("profile:editProfileDrawer.fields.phoneNumber")}
                  placeholder={t("profile:editProfileDrawer.placeholders.phoneNumber")}
                  keyboardType="phone-pad"
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>
        </DrawerScrollView>

        <DrawerFooter style={styles.footer}>
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              hasChanges:
                state.values.avatar !== null ||
                state.values.displayName !== initialValues.displayName ||
                state.values.phoneNumber !== initialValues.phoneNumber,
            })}
          >
            {({ canSubmit, isSubmitting, hasChanges }) => (
              <Button
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || !hasChanges || isSubmitting}
                isLoading={isSubmitting}
                onPress={() => form.handleSubmit()}
              >
                {t("profile:editProfileDrawer.submit")}
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
  footer: {
    paddingTop: theme.spacing(2),
    backgroundColor: "transparent",
  },
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
