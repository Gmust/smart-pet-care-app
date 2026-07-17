import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DateTimeField } from "@/common/components/DateTimeField";
import { Button } from "@/shadecn/ui/button";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";

import { CARE_CATEGORY_LABEL_KEYS } from "../../constants";
import { useCreatePlannedHealthEventMutation } from "../../queries/useCreatePlannedHealthEventMutation";
import { useUpdatePlannedHealthEventMutation } from "../../queries/useUpdatePlannedHealthEventMutation";
import {
  type PlannedHealthEventFormValues,
  plannedHealthEventSchema,
} from "../../schemas/planned-health-event.schema";
import type { PlannedHealthEvent, PlannedHealthEventCategory } from "../../types";
import { formatTimeOfDay, parseTimeOfDay } from "../../utils/timeOfDay";
import { CareDrawerShell } from "./CareDrawerShell";
import dayjs from "dayjs";

type Props = {
  petId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category?: PlannedHealthEventCategory;
  event?: PlannedHealthEvent;
};

const defaultValues: PlannedHealthEventFormValues = {
  title: "",
  time: "",
  intervalN: 1,
  lastDoneAt: undefined,
  productName: undefined,
  notes: undefined,
};

export function AddPlannedHealthEventDrawer({ petId, isOpen, setIsOpen, category, event }: Props) {
  const { t } = useTranslation(["care", "common"]);
  const isEditMode = !!event;
  // Kept in sync manually with AddCareRuleDrawer.tsx (and
  // CareCategorySection.tsx's fixedSlots title logic). If this changes,
  // check those too.
  const labelKey = category ? CARE_CATEGORY_LABEL_KEYS[category] : undefined;
  const isFixedSlot = !!labelKey;
  const categoryLabel = labelKey ? t(labelKey) : undefined;

  const { mutateAsync: createEvent, isPending: isCreating } = useCreatePlannedHealthEventMutation();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdatePlannedHealthEventMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: plannedHealthEventSchema(t), onSubmit: plannedHealthEventSchema(t) },
    onSubmit: async ({ value }) => {
      if (!category) return;

      const title = isFixedSlot && categoryLabel ? categoryLabel : value.title;

      try {
        if (isEditMode && event) {
          await updateEvent({
            id: event.id,
            petId,
            patch: {
              title,
              reminderTime: value.time,
              intervalN: value.intervalN,
              lastDoneAt: value.lastDoneAt,
              productName: value.productName,
              notes: value.notes,
            },
          });
        } else {
          await createEvent({
            petId,
            category,
            title,
            reminderTime: value.time,
            intervalN: value.intervalN,
            lastDoneAt: value.lastDoneAt,
            productName: value.productName,
            notes: value.notes,
          });
        }
        Toast.show({
          type: "success",
          text1: t(
            isEditMode
              ? "care:forms.plannedHealthEvent.updateSuccess"
              : "care:forms.plannedHealthEvent.createSuccess"
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
      event
        ? {
            title: event.title,
            time: event.reminderTime,
            intervalN: event.intervalN,
            lastDoneAt: event.lastDoneAt,
            productName: event.productName,
            notes: event.notes,
          }
        : { ...defaultValues, title: categoryLabel ?? "" }
    );
  }, [isOpen, event, categoryLabel, form]);

  return (
    <CareDrawerShell
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      snapPoints={["94%"]}
      title={t(
        isEditMode
          ? "care:forms.plannedHealthEvent.editTitle"
          : "care:forms.plannedHealthEvent.createTitle"
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
                  ? "care:forms.plannedHealthEvent.submitEdit"
                  : "care:forms.plannedHealthEvent.submitCreate"
              )}
            </Button>
          )}
        </form.Subscribe>
      }
    >
      {!isFixedSlot && (
        <form.Field name="title">
          {(field) => (
            <View style={styles.field}>
              <Input
                label={t("care:forms.plannedHealthEvent.fields.title")}
                placeholder={t("care:forms.plannedHealthEvent.placeholders.title")}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </View>
          )}
        </form.Field>
      )}

      <form.Field name="time">
        {(field) => (
          <View style={styles.field}>
            <DateTimeField
              mode="time"
              label={t("care:forms.plannedHealthEvent.fields.time")}
              placeholder={t("care:forms.plannedHealthEvent.placeholders.time")}
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

      <form.Field name="intervalN">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("care:forms.plannedHealthEvent.fields.intervalMonths")}
              placeholder={t("care:forms.plannedHealthEvent.placeholders.interval")}
              value={field.state.value != null ? String(field.state.value) : ""}
              onChangeText={(text) => field.handleChange(text === "" ? 0 : Number(text))}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <form.Field name="productName">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("care:forms.plannedHealthEvent.fields.productName")}
              placeholder={t("care:forms.plannedHealthEvent.placeholders.productName")}
              value={field.state.value ?? ""}
              onChangeText={(text) => field.handleChange(text === "" ? undefined : text)}
              onBlur={field.handleBlur}
            />
          </View>
        )}
      </form.Field>

      <form.Field name="lastDoneAt">
        {(field) => (
          <View style={styles.field}>
            <DateTimeField
              mode="date"
              label={t("care:forms.plannedHealthEvent.fields.lastDoneAt")}
              placeholder={t("care:forms.plannedHealthEvent.placeholders.lastDoneAt")}
              value={field.state.value ? new Date(field.state.value) : null}
              display={(date) => dayjs(date).format("MMM D, YYYY")}
              onChange={(date) => field.handleChange(date.toISOString())}
              onBlur={field.handleBlur}
            />
          </View>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("care:forms.plannedHealthEvent.fields.notes")}
              placeholder={t("care:forms.plannedHealthEvent.placeholders.notes")}
              value={field.state.value ?? ""}
              onChangeText={(text) => field.handleChange(text === "" ? undefined : text)}
              onBlur={field.handleBlur}
            />
          </View>
        )}
      </form.Field>
    </CareDrawerShell>
  );
}

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1),
  },
}));
