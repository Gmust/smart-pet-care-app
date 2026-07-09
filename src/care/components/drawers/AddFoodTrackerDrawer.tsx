import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DateTimeField } from "@/common/components/DateTimeField";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

import { useCreateFoodTrackerMutation } from "../../queries/useCreateFoodTrackerMutation";
import { useUpdateFoodTrackerMutation } from "../../queries/useUpdateFoodTrackerMutation";
import { type FoodTrackerFormValues, foodTrackerSchema } from "../../schemas/food-tracker.schema";
import type { FoodTracker } from "../../types";
import { toGrams } from "../../utils/weight";
import { CareDrawerShell } from "./CareDrawerShell";

type Props = {
  petId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tracker?: FoodTracker;
};

const defaultValues: FoodTrackerFormValues = {
  foodName: "",
  packageWeight: 0,
  packageWeightUnit: "kg",
  packageCount: 1,
  openedAt: "",
  portionWeight: 0,
  portionWeightUnit: "g",
  feedingFrequency: "daily",
  feedingsPerDay: undefined,
  feedingsPerWeek: undefined,
};

function BinaryToggle<T extends string>({
  options,
  optionLabels,
  value,
  onChange,
}: {
  options: readonly [T, T];
  optionLabels: readonly [string, string];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option, index) => (
        <Chip
          key={option}
          label={optionLabels[index]}
          tone={value === option ? "primary" : "neutral"}
          variant={value === option ? "default" : "ghost"}
          onPress={() => onChange(option)}
        />
      ))}
    </View>
  );
}

export function AddFoodTrackerDrawer({ petId, isOpen, setIsOpen, tracker }: Props) {
  const { t } = useTranslation(["care", "common"]);
  const isEditMode = !!tracker;

  const { mutateAsync: createTracker, isPending: isCreating } = useCreateFoodTrackerMutation();
  const { mutateAsync: updateTracker, isPending: isUpdating } = useUpdateFoodTrackerMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: foodTrackerSchema(t), onSubmit: foodTrackerSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && tracker) {
          await updateTracker({ id: tracker.id, petId, patch: value });
        } else {
          await createTracker({ petId, ...value });
        }
        Toast.show({
          type: "success",
          text1: t(
            isEditMode
              ? "care:forms.foodTracker.updateSuccess"
              : "care:forms.foodTracker.createSuccess"
          ),
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
    form.reset(
      tracker
        ? {
            foodName: tracker.foodName,
            packageWeight: tracker.packageWeight,
            packageWeightUnit: tracker.packageWeightUnit,
            packageCount: tracker.packageCount,
            openedAt: tracker.openedAt,
            portionWeight: toGrams(tracker.portionWeight, tracker.portionWeightUnit),
            portionWeightUnit: "g",
            feedingFrequency: tracker.feedingFrequency,
            feedingsPerDay: tracker.feedingsPerDay,
            feedingsPerWeek: tracker.feedingsPerWeek,
          }
        : defaultValues
    );
  }, [isOpen, tracker, form]);

  return (
    <CareDrawerShell
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      snapPoints={["94%"]}
      title={t(
        isEditMode ? "care:forms.foodTracker.editTitle" : "care:forms.foodTracker.createTitle"
      )}
      footer={
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              size="lg"
              variant="primary"
              disabled={!canSubmit || isSaving}
              isLoading={isSubmitting || isSaving}
              onPress={() => form.handleSubmit()}
            >
              {t(
                isEditMode
                  ? "care:forms.foodTracker.submitEdit"
                  : "care:forms.foodTracker.submitCreate"
              )}
            </Button>
          )}
        </form.Subscribe>
      }
    >
      <form.Field name="foodName">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("care:forms.foodTracker.fields.foodName")}
              placeholder={t("care:forms.foodTracker.placeholders.foodName")}
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <View style={styles.row}>
        <form.Field name="packageWeight">
          {(field) => (
            <View style={[styles.field, styles.rowItem]}>
              <Input
                label={t("care:forms.foodTracker.fields.packageWeight")}
                value={field.state.value ? String(field.state.value) : ""}
                onChangeText={(text) => field.handleChange(text === "" ? 0 : Number(text))}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </View>
          )}
        </form.Field>

        <form.Field name="packageWeightUnit">
          {(field) => (
            <View style={styles.field}>
              <Text style={styles.label}> </Text>
              <BinaryToggle
                options={["kg", "g"] as const}
                optionLabels={["kg", "g"] as const}
                value={field.state.value}
                onChange={field.handleChange}
              />
            </View>
          )}
        </form.Field>
      </View>

      <form.Field name="packageCount">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("care:forms.foodTracker.fields.packageCount")}
              placeholder={t("care:forms.foodTracker.placeholders.packageCount")}
              value={field.state.value ? String(field.state.value) : ""}
              onChangeText={(text) => field.handleChange(text === "" ? 0 : Number(text))}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <form.Field name="openedAt">
        {(field) => (
          <View style={styles.field}>
            <DateTimeField
              mode="date"
              label={t("care:forms.foodTracker.fields.openedAt")}
              placeholder={t("care:forms.foodTracker.placeholders.openedAt")}
              value={field.state.value ? new Date(field.state.value) : null}
              display={(date) => date.toLocaleDateString()}
              onChange={(date) => field.handleChange(date.toISOString())}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <View style={styles.row}>
        <form.Field name="portionWeight">
          {(field) => (
            <View style={[styles.field, styles.rowItem]}>
              <Input
                label={t("care:forms.foodTracker.fields.portionWeight")}
                value={field.state.value ? String(field.state.value) : ""}
                onChangeText={(text) => field.handleChange(text === "" ? 0 : Number(text))}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </View>
          )}
        </form.Field>

        <View style={styles.field}>
          <Text style={styles.label}> </Text>
          <View style={styles.chips}>
            <Chip
              label={t("care:forms.foodTracker.units.grams")}
              tone="primary"
              variant="default"
            />
          </View>
        </View>
      </View>

      <form.Field name="feedingFrequency">
        {(field) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t("care:forms.foodTracker.fields.feedingFrequency")}</Text>
            <BinaryToggle
              options={["daily", "weekly"] as const}
              optionLabels={[
                t("care:forms.foodTracker.frequencyOptions.daily"),
                t("care:forms.foodTracker.frequencyOptions.weekly"),
              ]}
              value={field.state.value}
              onChange={field.handleChange}
            />
          </View>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.feedingFrequency}>
        {(frequency) =>
          frequency === "daily" ? (
            <form.Field name="feedingsPerDay">
              {(field) => (
                <View style={styles.field}>
                  <Input
                    label={t("care:forms.foodTracker.fields.feedingsPerDay")}
                    value={field.state.value != null ? String(field.state.value) : ""}
                    onChangeText={(text) =>
                      field.handleChange(text === "" ? undefined : Number(text))
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors.length > 0}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </View>
              )}
            </form.Field>
          ) : (
            <form.Field name="feedingsPerWeek">
              {(field) => (
                <View style={styles.field}>
                  <Input
                    label={t("care:forms.foodTracker.fields.feedingsPerWeek")}
                    value={field.state.value != null ? String(field.state.value) : ""}
                    onChangeText={(text) =>
                      field.handleChange(text === "" ? undefined : Number(text))
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors.length > 0}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </View>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>
    </CareDrawerShell>
  );
}

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1),
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing(3),
    alignItems: "flex-start",
  },
  rowItem: {
    flex: 1,
  },
  label: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
  },
}));
