import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { NutritionGoalResponseDto } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

import { PORTION_UNITS } from "../../constants";
import { useUpsertNutritionGoalMutation } from "../../queries/useUpsertNutritionGoalMutation";
import {
  type NutritionGoalFormValues,
  nutritionGoalSchema,
} from "../../schemas/nutrition-goal.schema";
import { buildNutritionGoalUpsert } from "../../utils/buildNutritionGoalUpsert";
import { toApiNumber } from "../../utils/toApiNumber";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  petId: string;
  goal?: NutritionGoalResponseDto | null;
  onRemove?: () => void;
};

const toFormValues = (goal?: NutritionGoalResponseDto | null): NutritionGoalFormValues => ({
  dailyCalorieTarget: String(toApiNumber(goal?.dailyCalorieTarget) ?? ""),
  dailyPortionTarget: String(toApiNumber(goal?.dailyPortionTarget) ?? ""),
  portionUnit: goal?.portionUnit ?? "",
  mealsPerDay: String(toApiNumber(goal?.mealsPerDay) ?? ""),
});

export const DailyGoalDrawer = ({ isOpen, setIsOpen, petId, goal, onRemove }: Props) => {
  const { t } = useTranslation(["feeding", "common"]);

  const { mutateAsync: saveGoal, isPending: isSaving } = useUpsertNutritionGoalMutation();

  const form = useForm({
    defaultValues: toFormValues(goal),
    validators: {
      onChange: nutritionGoalSchema(t),
      onSubmit: nutritionGoalSchema(t),
    },
    onSubmit: async ({ value }) => {
      try {
        await saveGoal({ petId, dto: buildNutritionGoalUpsert(value) });

        Toast.show({ type: "success", text1: t("feeding:forms.goal.createSuccess") });
        // Makes the saved values the baseline, so the next open re-seeds from the goal.
        form.reset(value);
        setIsOpen(false);
      } catch (e) {
        setApiFieldErrors(form, e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
      }
    },
  });

  // The drawer stays mounted: re-seed from a changed goal on open, but keep a draft the user
  // started.
  useEffect(() => {
    if (!isOpen || form.state.isDirty) return;
    form.reset(toFormValues(goal));
  }, [isOpen, goal, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={["74%"]} enableDynamicSizing={false}>
        <DrawerHeader>
          <DrawerTitle>{t("feeding:forms.goal.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="dailyCalorieTarget">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.goal.fields.dailyCalorieTarget")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.goal.placeholders.dailyCalorieTarget")}
                  keyboardType="number-pad"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <Text variant="caption" style={styles.hint}>
                  {t("feeding:forms.goal.hints.dailyCalorieTarget")}
                </Text>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="dailyPortionTarget">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.goal.fields.dailyPortionTarget")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.goal.placeholders.dailyPortionTarget")}
                  keyboardType="decimal-pad"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="portionUnit">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.goal.fields.portionUnit")}
                </Text>
                <View style={styles.chips}>
                  {PORTION_UNITS.map((unit) => {
                    const isSelected = field.state.value === unit;
                    return (
                      <Chip
                        key={unit}
                        label={t(`feeding:portionUnits.${unit}`)}
                        tone={isSelected ? "primary" : "neutral"}
                        variant={isSelected ? "default" : "ghost"}
                        // PUT can clear the unit, so tapping the selected one deselects it.
                        onPress={() => field.handleChange(isSelected ? "" : unit)}
                      />
                    );
                  })}
                </View>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="mealsPerDay">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.goal.fields.mealsPerDay")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.goal.placeholders.mealsPerDay")}
                  keyboardType="number-pad"
                  value={field.state.value}
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
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isSaving}
                isLoading={isSubmitting || isSaving}
                onPress={() => form.handleSubmit()}
              >
                {t("feeding:forms.goal.submit")}
              </Button>
            )}
          </form.Subscribe>

          {!!goal && !!onRemove && (
            <Button variant="text" size="inline" onPress={onRemove}>
              {t("feeding:forms.goal.delete")}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(20),
  },
  field: {
    gap: theme.spacing(1),
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  hint: {
    color: theme.palette.brand.textFaint,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  footer: {
    alignItems: "center",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
    backgroundColor: theme.palette.transparent,
  },
  submitButton: {
    alignSelf: "stretch",
  },
}));
