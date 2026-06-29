import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { useUpdateProfileMutation } from "@/profile/queries/useUpdateProfileMutation";
import { editProfileSchema } from "@/profile/schemas/edit-profile.schema";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const EditProfileDrawer = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation(["profile", "common"]);
  const { mutateAsync: updateProfile, isPending: isProfileUpdating } = useUpdateProfileMutation();
  const { data: profile } = useProfileMeQuery();

  const form = useForm({
    defaultValues: {
      displayName: profile?.displayName ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    },
    validators: { onChange: editProfileSchema(t), onSubmit: editProfileSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile({
          displayName: value.displayName || null,
          phoneNumber: value.phoneNumber || null,
        });
        Toast.show({ type: "success", text1: t("profile:updateSuccessMessage") });
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["70%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("profile:editProfileDrawer.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
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
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                size="lg"
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isProfileUpdating}
                isLoading={isSubmitting || isProfileUpdating}
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
  field: {
    gap: theme.spacing(1.5),
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
