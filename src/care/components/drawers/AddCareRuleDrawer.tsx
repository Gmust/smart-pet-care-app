import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DateTimeField } from "@/common/components/DateTimeField";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { Text } from "@/shadecn/ui/text";

import { CARE_CATEGORY_LABEL_KEYS } from "../../constants";
import { useCreateCareRuleMutation } from "../../queries/useCreateCareRuleMutation";
import { useUpdateCareRuleMutation } from "../../queries/useUpdateCareRuleMutation";
import { type CareRuleFormValues, careRuleSchema } from "../../schemas/care-rule.schema";
import type { CareCategory, CareRule, DayOfWeek, RecurrenceType } from "../../types";
import { formatTimeOfDay, parseTimeOfDay } from "../../utils/timeOfDay";

type Props = {
  petId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category?: CareCategory;
  rule?: CareRule;
};

const RECURRENCE_TYPES: RecurrenceType[] = ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"];

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
};

export function AddCareRuleDrawer({ petId, isOpen, setIsOpen, category, rule }: Props) {
  const { t } = useTranslation(["care", "common"]);
  const isEditMode = !!rule;
  const labelKey = category ? CARE_CATEGORY_LABEL_KEYS[category] : undefined;
  const isFixedSlot = !!labelKey;
  const categoryLabel = labelKey ? t(labelKey) : undefined;

  const { mutateAsync: createRule, isPending: isCreating } = useCreateCareRuleMutation();
  const { mutateAsync: updateRule, isPending: isUpdating } = useUpdateCareRuleMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: careRuleSchema(t), onSubmit: careRuleSchema(t) },
    onSubmit: async ({ value }) => {
      if (!category) return;

      const title = isFixedSlot && categoryLabel ? categoryLabel : value.title;

      try {
        if (isEditMode && rule) {
          await updateRule({
            id: rule.id,
            petId,
            patch: {
              title,
              reminderTime: value.time,
              recurrenceType: value.recurrenceType,
              weekDays: value.recurrenceType === "Weekly" ? value.weekDays : undefined,
              intervalN:
                value.recurrenceType === "EveryNWeeks" || value.recurrenceType === "EveryNMonths"
                  ? value.intervalN
                  : undefined,
            },
          });
        } else {
          await createRule({
            petId,
            category,
            title,
            reminderTime: value.time,
            recurrenceType: value.recurrenceType,
            weekDays: value.recurrenceType === "Weekly" ? value.weekDays : undefined,
            intervalN:
              value.recurrenceType === "EveryNWeeks" || value.recurrenceType === "EveryNMonths"
                ? value.intervalN
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
    form.reset(
      rule
        ? {
            title: rule.title,
            time: rule.reminderTime,
            recurrenceType: rule.recurrenceType,
            intervalN: rule.intervalN,
            weekDays: rule.weekDays ?? [],
          }
        : { ...defaultValues, title: categoryLabel ?? "" }
    );
  }, [isOpen, rule, categoryLabel, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["90%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropPressBehavior="none"
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>
            {t(isEditMode ? "care:forms.careRule.editTitle" : "care:forms.careRule.createTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {!isFixedSlot && (
            <form.Field name="title">
              {(field) => (
                <View style={styles.field}>
                  <Input
                    label={t("care:forms.careRule.fields.title")}
                    placeholder={t("care:forms.careRule.placeholders.title")}
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
                <Text style={styles.label}>{t("care:forms.careRule.fields.recurrenceType")}</Text>
                <Select
                  containerStyle={styles.selectContainer}
                  value={{
                    value: field.state.value,
                    label: t(`care:forms.careRule.recurrenceOptions.${field.state.value}`),
                  }}
                  onValueChange={(option) => {
                    const next = RECURRENCE_TYPES.find((type) => type === option?.value);
                    if (next) field.handleChange(next);
                  }}
                >
                  <SelectTrigger style={styles.selectTrigger}>
                    <SelectValue
                      placeholder={t("care:forms.careRule.placeholders.recurrenceType")}
                    />
                  </SelectTrigger>
                  <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                    {RECURRENCE_TYPES.map((type) => (
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
            {(recurrenceType) =>
              recurrenceType === "Weekly" ? (
                <form.Field name="weekDays">
                  {(field) => {
                    const selectedDays = field.state.value ?? [];
                    return (
                      <View style={styles.field}>
                        <Text style={styles.label}>{t("care:forms.careRule.fields.weekDays")}</Text>
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
              ) : null
            }
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.values.recurrenceType}>
            {(recurrenceType) =>
              recurrenceType === "EveryNWeeks" || recurrenceType === "EveryNMonths" ? (
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
              ) : null
            }
          </form.Subscribe>
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
                {t(
                  isEditMode ? "care:forms.careRule.submitEdit" : "care:forms.careRule.submitCreate"
                )}
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
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
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
  footer: {
    paddingTop: theme.spacing(1),
    backgroundColor: "transparent",
  },
}));
