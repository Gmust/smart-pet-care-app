import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DateTimeField } from "@/common/components/DateTimeField";
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

import { useCreateMealMutation } from "../../queries/useCreateMealMutation";
import { useUpdateMealMutation } from "../../queries/useUpdateMealMutation";
import { type MealFormValues, mealSchema } from "../../schemas/meal.schema";
import type { MealRule } from "../../types";
import { formatTimeOfDay, parseTimeOfDay } from "../../utils/timeOfDay";

type Props = {
  petId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  meal?: MealRule;
};

const defaultValues: MealFormValues = { title: "", time: "" };

export function AddMealDrawer({ petId, isOpen, setIsOpen, meal }: Props) {
  const { t } = useTranslation(["care", "common"]);
  const isEditMode = !!meal;

  const { mutateAsync: createMeal, isPending: isCreating } = useCreateMealMutation();
  const { mutateAsync: updateMeal, isPending: isUpdating } = useUpdateMealMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: mealSchema(t), onSubmit: mealSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && meal) {
          await updateMeal({ id: meal.id, petId, patch: value });
        } else {
          await createMeal({
            petId,
            title: value.title,
            time: value.time,
            recurrenceType: "Daily",
          });
        }
        Toast.show({
          type: "success",
          text1: t(isEditMode ? "care:forms.meal.updateSuccess" : "care:forms.meal.createSuccess"),
        });
        form.reset();
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(meal ? { title: meal.title, time: meal.time } : defaultValues);
  }, [isOpen, meal, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["60%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropPressBehavior="none"
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>
            {t(isEditMode ? "care:forms.meal.editTitle" : "care:forms.meal.createTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <form.Field name="title">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("care:forms.meal.fields.title")}
                  placeholder={t("care:forms.meal.placeholders.title")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="time">
            {(field) => (
              <View style={styles.field}>
                <DateTimeField
                  mode="time"
                  label={t("care:forms.meal.fields.time")}
                  placeholder={t("care:forms.meal.placeholders.time")}
                  value={field.state.value ? parseTimeOfDay(field.state.value) : null}
                  display={formatTimeOfDay}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(formatTimeOfDay(date))}
                  onBlur={field.handleBlur}
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
                disabled={!canSubmit || isSaving}
                isLoading={isSubmitting || isSaving}
                onPress={() => form.handleSubmit()}
              >
                {t(isEditMode ? "care:forms.meal.submitEdit" : "care:forms.meal.submitCreate")}
              </Button>
            )}
          </form.Subscribe>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

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
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  field: {
    gap: theme.spacing(1),
  },
  footer: {
    paddingTop: theme.spacing(1),
    backgroundColor: "transparent",
  },
}));
