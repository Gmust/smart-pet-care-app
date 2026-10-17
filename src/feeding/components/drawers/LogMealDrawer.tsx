import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { FeedingLogResponseDto } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { useCompleteReminderMutation } from "@/reminders/queries/useCompleteReminderMutation";
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

import { FOOD_TYPES, PORTION_UNITS } from "../../constants";
import { useCreateFeedingLogMutation } from "../../queries/useCreateFeedingLogMutation";
import { useUpdateFeedingLogMutation } from "../../queries/useUpdateFeedingLogMutation";
import { type FeedingLogFormValues, feedingLogSchema } from "../../schemas/feeding-log.schema";
import type { FeedingSlot } from "../../types";
import { buildFeedingLogCreate } from "../../utils/buildFeedingLogCreate";
import { buildFeedingLogPatch } from "../../utils/buildFeedingLogPatch";
import { toApiNumber } from "../../utils/toApiNumber";
import { DateTimeFieldRow } from "../DateTimeFieldRow";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  petId: string;
  log?: FeedingLogResponseDto;
  slot?: FeedingSlot;
};

const toFormValues = (log?: FeedingLogResponseDto, slot?: FeedingSlot): FeedingLogFormValues => ({
  fedAt: log?.fedAt ?? slot?.fedAt ?? new Date().toISOString(),
  foodType: log?.foodType ?? "",
  foodName: log?.foodName ?? "",
  portionAmount: String(toApiNumber(log?.portionAmount) ?? ""),
  portionUnit: log?.portionUnit ?? "",
  approxCalories: String(toApiNumber(log?.approxCalories) ?? ""),
  notes: log?.notes ?? "",
});

export const LogMealDrawer = ({ isOpen, setIsOpen, petId, log, slot }: Props) => {
  const { t } = useTranslation(["feeding", "common"]);

  const isEditMode = !!log;
  const hasStoredPortion = !!log && (toApiNumber(log.portionAmount) !== null || !!log.portionUnit);

  const { mutateAsync: createLog, isPending: isCreating } = useCreateFeedingLogMutation();
  const { mutateAsync: updateLog, isPending: isUpdating } = useUpdateFeedingLogMutation();
  const { mutateAsync: completeReminder, isPending: isClosingSlot } = useCompleteReminderMutation();
  const isSaving = isCreating || isUpdating || isClosingSlot;

  const form = useForm({
    defaultValues: toFormValues(log, slot),
    validators: {
      onChange: feedingLogSchema(t, { requirePortion: hasStoredPortion }),
      onSubmit: feedingLogSchema(t, { requirePortion: hasStoredPortion }),
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode) {
          // A log without an id cannot be PATCHed; falling through would POST a duplicate and
          // report success.
          if (!log?.id) {
            Toast.show({ type: "error", text1: t("feeding:forms.meal.missingId") });
            return;
          }

          const dto = buildFeedingLogPatch(value, log);
          if (Object.keys(dto).length > 0) {
            await updateLog({ petId, logId: log.id, dto });
          }
        } else {
          await createLog({
            petId,
            dto: {
              ...buildFeedingLogCreate({
                ...value,
                foodName: value.foodName.trim() || slot?.title || "",
              }),
              // Ties the meal to its reminder, which also records the slot as done.
              ...(slot ? { reminderId: slot.reminderId } : {}),
            },
          });
        }

        // The meal is saved by now. If closing its slot fails, saying so beats
        // an error that invites a retry, which would log the meal twice.
        let isSlotClosed = true;
        if (slot) {
          try {
            await completeReminder({ id: slot.reminderId, dto: { performedAt: value.fedAt } });
          } catch {
            isSlotClosed = false;
          }
        }

        Toast.show(
          isSlotClosed
            ? {
                type: "success",
                text1: t(
                  isEditMode
                    ? "feeding:forms.meal.updateSuccess"
                    : "feeding:forms.meal.createSuccess"
                ),
              }
            : { type: "error", text1: t("feeding:forms.meal.slotNotClosed") }
        );
        form.reset();
        setIsOpen(false);
      } catch (e) {
        setApiFieldErrors(form, e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
      }
    },
  });

  // The drawer stays mounted: re-seed an untouched form on open (its "now" goes stale), but keep a
  // draft the user started.
  useEffect(() => {
    if (!isOpen || isEditMode || slot || form.state.isDirty) return;
    form.reset(toFormValues());
  }, [isOpen, isEditMode, slot, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={["93%"]} enableDynamicSizing={false}>
        <DrawerHeader>
          <DrawerTitle>
            {t(isEditMode ? "feeding:forms.meal.editTitle" : "feeding:forms.meal.createTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="fedAt">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.fedAt")}
                </Text>
                <DateTimeFieldRow
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                  datePlaceholder={t("feeding:forms.meal.placeholders.fedAtDate")}
                  timePlaceholder={t("feeding:forms.meal.placeholders.fedAtTime")}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="foodType">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.foodType")}
                </Text>
                <View style={styles.chips}>
                  {FOOD_TYPES.map((foodType) => {
                    const isSelected = field.state.value === foodType;
                    return (
                      <Chip
                        key={foodType}
                        label={t(`feeding:foodTypes.${foodType}`)}
                        tone={isSelected ? "primary" : "neutral"}
                        variant={isSelected ? "default" : "ghost"}
                        onPress={() => field.handleChange(foodType)}
                      />
                    );
                  })}
                </View>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="foodName">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.foodName")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.meal.placeholders.foodName")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="portionAmount">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.portionAmount")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.meal.placeholders.portionAmount")}
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
                  {t("feeding:forms.meal.fields.portionUnit")}
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
                        // A stored portion cannot be cleared through PATCH, so
                        // tapping the selected unit only deselects in create mode.
                        onPress={() =>
                          field.handleChange(isSelected && !hasStoredPortion ? "" : unit)
                        }
                      />
                    );
                  })}
                </View>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="approxCalories">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.approxCalories")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.meal.placeholders.approxCalories")}
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

          <form.Field name="notes">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.meal.fields.notes")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.meal.placeholders.notes")}
                  multiline
                  containerStyle={styles.notesBox}
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
                disabled={!canSubmit || isSaving}
                isLoading={isSubmitting || isSaving}
                onPress={() => form.handleSubmit()}
              >
                {t("feeding:forms.meal.submit")}
              </Button>
            )}
          </form.Subscribe>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  notesBox: {
    minHeight: theme.spacing(28),
    alignItems: "flex-start",
  },
  footer: {
    paddingTop: theme.spacing(1),
    backgroundColor: theme.palette.transparent,
  },
}));
