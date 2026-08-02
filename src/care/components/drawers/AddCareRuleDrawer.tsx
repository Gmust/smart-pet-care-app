import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DateTimeField } from "@/common/components/DateTimeField";
import { formatDateOfDay, parseDateOfDay } from "@/common/utils/dateOfDay";
import { formatTimeOfDay, parseTimeOfDay } from "@/common/utils/timeOfDay";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { Text } from "@/shadecn/ui/text";

import {
  CARE_CATEGORY_ALLOWED_RECURRENCE_TYPES,
  CARE_CATEGORY_DEFAULT_RECURRENCE,
  CARE_CATEGORY_LABEL_KEYS,
  CARE_CATEGORY_NAME_KEYS,
  CARE_CATEGORY_TITLE_PLACEHOLDER_KEYS,
} from "../../constants";
import { useCreateCareRuleMutation } from "../../queries/useCreateCareRuleMutation";
import { useUpdateCareRuleMutation } from "../../queries/useUpdateCareRuleMutation";
import { type CareRuleFormValues, careRuleSchema } from "../../schemas/care-rule.schema";
import type { CareCategory, CareRule, DayOfWeek, RecurrenceType } from "../../types";

import { CareDrawerShell } from "./CareDrawerShell";

type Props = {
  petId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category?: CareCategory;
  rule?: CareRule;
};

const ALL_RECURRENCE_TYPES: RecurrenceType[] = [
  "Daily",
  "Weekly",
  "EveryNWeeks",
  "EveryNMonths",
  "Yearly",
];

const WEEK_DAY_ORDER: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SELECT_PORTAL_HOST = "select";

const defaultValues: CareRuleFormValues = {
  title: "",
  time: "",
  recurrenceType: "Daily",
  intervalN: undefined,
  weekDays: [],
  startDate: undefined,
};

export function AddCareRuleDrawer({ petId, isOpen, setIsOpen, category, rule }: Props) {
  const { t } = useTranslation(["care", "common"]);
  const isEditMode = !!rule;
  const labelKey = category ? CARE_CATEGORY_LABEL_KEYS[category] : undefined;
  const isFixedSlot = !!labelKey;
  const categoryLabel = labelKey ? t(labelKey) : undefined;
  const titlePlaceholderKey =
    (category && CARE_CATEGORY_TITLE_PLACEHOLDER_KEYS[category]) ||
    "care:forms.careRule.placeholders.title";
  const categoryName = category ? t(CARE_CATEGORY_NAME_KEYS[category]) : "";
  const allowedRecurrenceTypes = category
    ? (CARE_CATEGORY_ALLOWED_RECURRENCE_TYPES[category] ?? ALL_RECURRENCE_TYPES)
    : ALL_RECURRENCE_TYPES;

  const { mutateAsync: createRule, isPending: isCreating } = useCreateCareRuleMutation();
  const { mutateAsync: updateRule, isPending: isUpdating } = useUpdateCareRuleMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: careRuleSchema(t), onSubmit: careRuleSchema(t) },
    onSubmit: async ({ value }) => {
      if (!category) return;

      const title = categoryLabel ?? value.title;

      // Collapse recurrence choices that are equivalent to a simpler type,
      // so the recurrence chip on the card doesn't end up showing e.g.
      // "Every 12 months" when "Every year" reads better and is shorter.
      const isEveryTwelveMonths = value.recurrenceType === "EveryNMonths" && value.intervalN === 12;
      const isEveryWeekDay =
        value.recurrenceType === "Weekly" && value.weekDays.length === WEEK_DAY_ORDER.length;
      const recurrenceType = isEveryTwelveMonths
        ? "Yearly"
        : isEveryWeekDay
          ? "Daily"
          : value.recurrenceType;
      const weekDays = isEveryWeekDay ? [] : value.weekDays;
      const intervalN = isEveryTwelveMonths ? undefined : value.intervalN;

      try {
        if (rule) {
          await updateRule({
            id: rule.id,
            petId,
            patch: {
              title,
              reminderTime: value.time,
              recurrenceType,
              weekDays:
                recurrenceType === "Weekly" || recurrenceType === "EveryNWeeks"
                  ? weekDays
                  : undefined,
              intervalN:
                recurrenceType === "EveryNWeeks" || recurrenceType === "EveryNMonths"
                  ? intervalN
                  : undefined,
              startDate:
                recurrenceType === "EveryNMonths" || recurrenceType === "Yearly"
                  ? value.startDate
                  : undefined,
            },
          });
        } else {
          await createRule({
            petId,
            category,
            title,
            reminderTime: value.time,
            recurrenceType,
            weekDays:
              recurrenceType === "Weekly" || recurrenceType === "EveryNWeeks"
                ? weekDays
                : undefined,
            intervalN:
              recurrenceType === "EveryNWeeks" || recurrenceType === "EveryNMonths"
                ? intervalN
                : undefined,
            startDate:
              recurrenceType === "EveryNMonths" || recurrenceType === "Yearly"
                ? value.startDate
                : undefined,
          });
        }
        Toast.show({
          type: "success",
          text1: t(
            isEditMode ? "care:forms.careRule.updateSuccess" : "care:forms.careRule.createSuccess"
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
    const categoryDefaults = category ? CARE_CATEGORY_DEFAULT_RECURRENCE[category] : undefined;
    form.reset(
      rule
        ? {
            title: rule.title,
            time: rule.reminderTime,
            recurrenceType: rule.recurrenceType,
            intervalN: rule.intervalN,
            weekDays: rule.weekDays ?? [],
            startDate: rule.startDate,
          }
        : {
            ...defaultValues,
            title: categoryLabel ?? "",
            ...categoryDefaults,
          }
    );
  }, [isOpen, rule, category, categoryLabel, form]);

  return (
    <CareDrawerShell
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      snapPoints={["90%"]}
      title={t(isEditMode ? "care:forms.careRule.editTitle" : "care:forms.careRule.createTitle", {
        category: categoryName,
      })}
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
                isEditMode ? "care:forms.careRule.submitEdit" : "care:forms.careRule.submitCreate"
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
                label={t("care:forms.careRule.fields.title")}
                placeholder={t(titlePlaceholderKey)}
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
              label={t("care:forms.careRule.fields.time")}
              placeholder={t("care:forms.careRule.placeholders.time")}
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

      <form.Field name="recurrenceType">
        {(field) => (
          <View style={styles.field}>
            <Text variant="bodyS" style={styles.label}>
              {t("care:forms.careRule.fields.recurrenceType")}
            </Text>
            <Select
              containerStyle={styles.selectContainer}
              value={{
                value: field.state.value,
                label: t(`care:forms.careRule.recurrenceOptions.${field.state.value}`),
              }}
              onValueChange={(option) => {
                const next = allowedRecurrenceTypes.find((type) => type === option?.value);
                if (next) field.handleChange(next);
              }}
            >
              <SelectTrigger style={styles.selectTrigger}>
                <SelectValue placeholder={t("care:forms.careRule.placeholders.recurrenceType")} />
              </SelectTrigger>
              <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                {allowedRecurrenceTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    label={t(`care:forms.careRule.recurrenceOptions.${type}`)}
                  />
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.recurrenceType}>
        {(recurrenceType) => {
          if (recurrenceType === "Weekly") {
            return (
              <form.Field name="weekDays">
                {(field) => {
                  const selectedDays = field.state.value ?? [];
                  return (
                    <View style={styles.field}>
                      <Text variant="bodyS" style={styles.label}>
                        {t("care:forms.careRule.fields.weekDays")}
                      </Text>
                      <View style={styles.chips}>
                        {WEEK_DAY_ORDER.map((day) => {
                          const isSelected = selectedDays.includes(day);
                          return (
                            <Chip
                              key={day}
                              label={t(`care:daysShort.${day}`)}
                              tone={isSelected ? "primary" : "neutral"}
                              variant={isSelected ? "default" : "ghost"}
                              onPress={() =>
                                field.handleChange(
                                  isSelected
                                    ? selectedDays.filter((value) => value !== day)
                                    : [...selectedDays, day]
                                )
                              }
                            />
                          );
                        })}
                      </View>
                      <FieldError errors={field.state.meta.errors} />
                    </View>
                  );
                }}
              </form.Field>
            );
          }
          if (
            recurrenceType === "EveryNWeeks" ||
            recurrenceType === "EveryNMonths" ||
            recurrenceType === "Yearly"
          ) {
            return (
              <>
                {(recurrenceType === "EveryNWeeks" || recurrenceType === "EveryNMonths") && (
                  <form.Field name="intervalN">
                    {(field) => (
                      <View style={styles.field}>
                        <Input
                          label={t(
                            recurrenceType === "EveryNWeeks"
                              ? "care:forms.careRule.fields.intervalWeeks"
                              : "care:forms.careRule.fields.intervalMonths"
                          )}
                          placeholder={t("care:forms.careRule.placeholders.interval")}
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
                )}
                {recurrenceType === "EveryNWeeks" && (
                  <form.Field name="weekDays">
                    {(field) => {
                      const selectedDay = field.state.value?.[0];
                      return (
                        <View style={styles.field}>
                          <Text variant="bodyS" style={styles.label}>
                            {t("care:forms.careRule.fields.anchorWeekDay")}
                          </Text>
                          <View style={styles.chips}>
                            {WEEK_DAY_ORDER.map((day) => {
                              const isSelected = selectedDay === day;
                              return (
                                <Chip
                                  key={day}
                                  label={t(`care:daysShort.${day}`)}
                                  tone={isSelected ? "primary" : "neutral"}
                                  variant={isSelected ? "default" : "ghost"}
                                  onPress={() => field.handleChange(isSelected ? [] : [day])}
                                />
                              );
                            })}
                          </View>
                          <FieldError errors={field.state.meta.errors} />
                        </View>
                      );
                    }}
                  </form.Field>
                )}
                {(recurrenceType === "EveryNMonths" || recurrenceType === "Yearly") && (
                  <form.Field name="startDate">
                    {(field) => (
                      <View style={styles.field}>
                        <DateTimeField
                          mode="date"
                          label={t("care:forms.careRule.fields.startDate")}
                          placeholder={t("care:forms.careRule.placeholders.startDate")}
                          value={field.state.value ? parseDateOfDay(field.state.value) : null}
                          display={formatDateOfDay}
                          error={field.state.meta.errors.length > 0}
                          onChange={(date) => field.handleChange(formatDateOfDay(date))}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </View>
                    )}
                  </form.Field>
                )}
              </>
            );
          }
          return null;
        }}
      </form.Subscribe>
    </CareDrawerShell>
  );
}

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1),
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
  },
  selectContainer: {
    alignSelf: "stretch",
  },
  selectTrigger: {
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
}));
