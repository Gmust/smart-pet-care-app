import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";

import { DaysOfWeek, ReminderType, RepeatType } from "@/api/generated";
import { DateTimeField } from "@/common/components/DateTimeField";
import { getLocalTimeOfDay } from "@/common/utils/getLocalTimeOfDay";
import { formatTimeOfDay, parseTimeOfDay } from "@/common/utils/timeOfDay";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { Text } from "@/shadecn/ui/text";

import { useCreateRemindersMutation } from "../queries/useCreateRemindersMutation";
import { useGetReminderById } from "../queries/useGetReminderById";
import { useUpdateRemindersMutation } from "../queries/useUpdateRemindersMutation";
import { type CreateReminderForm, createReminderSchema } from "../schemas/create-reminder.schema";
import { ReminderPetSelectSkeleton } from "../skeletons/CreateReminderDrawerSkeleton";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  reminderId?: string;
};

const DAY_ORDER: DaysOfWeek[] = [
  DaysOfWeek.Monday,
  DaysOfWeek.Tuesday,
  DaysOfWeek.Wednesday,
  DaysOfWeek.Thursday,
  DaysOfWeek.Friday,
  DaysOfWeek.Saturday,
  DaysOfWeek.Sunday,
];

const REMINDER_TYPES: ReminderType[] = Object.values(ReminderType);
const REPEAT_TYPES: RepeatType[] = Object.values(RepeatType);
const SELECT_PORTAL_HOST = "select";

const defaultValues: CreateReminderForm = {
  petId: "",
  title: "",
  description: null,
  type: ReminderType.Feeding,
  repeatType: RepeatType.Weekly,
  days: [],
  date: null,
  time: "",
  endAt: null,
};

export const CreateReminderDrawer = ({ isOpen, setIsOpen, reminderId }: Props) => {
  const { t } = useTranslation(["reminders", "common"]);
  const { data: pets, isLoading: isPetsLoading } = usePetsQuery();

  const isEditMode = reminderId != null;

  const { data: reminder } = useGetReminderById(reminderId, isOpen && isEditMode);

  const { mutateAsync: createReminder, isPending: isReminderCreating } =
    useCreateRemindersMutation();
  const { mutateAsync: updateReminder, isPending: isReminderUpdating } =
    useUpdateRemindersMutation();

  const hasHydratedForm = useRef(false);

  const isReminderSaving = isReminderCreating || isReminderUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: createReminderSchema(t), onSubmit: createReminderSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && reminderId) {
          await updateReminder({
            id: reminderId,
            payload: {
              title: value.title,
              description: value.description ?? null,
              repeatType: value.repeatType,
              days: value.days ?? [],
              date: value.date ?? null,
              time: value.time,
              endAt: value.endAt ?? null,
            },
          });
        } else {
          await createReminder({
            petId: value.petId,
            title: value.title,
            description: value.description ?? null,
            type: value.type,
            repeatType: value.repeatType,
            days: value.days ?? [],
            date: value.date ?? null,
            time: value.time,
            endAt: value.endAt ?? null,
          });
        }
        Toast.show({
          type: "success",
          text1: t(isEditMode ? "reminders:updateSuccessMessage" : "reminders:successMessage"),
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
    if (!isEditMode || !reminder || hasHydratedForm.current) return;
    hasHydratedForm.current = true;

    form.reset({
      petId: reminder.petId ?? "",
      title: reminder.title ?? "",
      description: reminder.description ?? null,
      type: reminder.type ?? ReminderType.Feeding,
      repeatType: reminder.repeatType ?? RepeatType.Weekly,
      days: reminder.days ?? [],
      date: reminder.date ?? null,
      time: getLocalTimeOfDay(reminder) ?? "",
      endAt: reminder.endAt ?? null,
    });
  }, [isEditMode, reminder, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["94%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropPressBehavior="none"
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>
            {t(
              isEditMode
                ? "reminders:editReminderDrawer.title"
                : "reminders:createReminderDrawer.title"
            )}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <form.Field name="petId">
            {(field) => {
              const selected = pets?.find((pet) => pet.id === field.state.value);
              return (
                <View style={styles.field}>
                  <Text style={styles.label}>{t("reminders:createReminderDrawer.fields.pet")}</Text>
                  {isPetsLoading ? (
                    <ReminderPetSelectSkeleton />
                  ) : (
                    <Select
                      containerStyle={styles.selectContainer}
                      disabled={isEditMode}
                      value={
                        selected?.id != null
                          ? { value: selected.id, label: selected.name ?? "" }
                          : undefined
                      }
                      onValueChange={(option) => field.handleChange(option?.value ?? "")}
                    >
                      <SelectTrigger style={styles.selectTrigger}>
                        <SelectValue
                          placeholder={t("reminders:createReminderDrawer.placeholders.pet")}
                        />
                      </SelectTrigger>
                      <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                        {pets?.map((pet) =>
                          pet.id != null ? (
                            <SelectItem key={pet.id} value={pet.id} label={pet.name ?? ""} />
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <FieldError errors={field.state.meta.errors} />
                </View>
              );
            }}
          </form.Field>

          <form.Field name="title">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("reminders:createReminderDrawer.fields.title")}
                  placeholder={t("reminders:createReminderDrawer.placeholders.title")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                  containerStyle={styles.inputSurface}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("reminders:createReminderDrawer.fields.description")}
                  placeholder={t("reminders:createReminderDrawer.placeholders.description")}
                  value={field.state.value ?? ""}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                  multiline
                  numberOfLines={4}
                  containerStyle={[styles.inputSurface, styles.textArea]}
                  inputStyle={styles.textAreaInput}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="type">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("reminders:createReminderDrawer.fields.type")}</Text>
                <Select
                  containerStyle={styles.selectContainer}
                  disabled={isEditMode}
                  value={{
                    value: field.state.value,
                    label: t(`reminders:types.${field.state.value}`),
                  }}
                  onValueChange={(option) => {
                    const next = REMINDER_TYPES.find((type) => type === option?.value);
                    if (next) field.handleChange(next);
                  }}
                >
                  <SelectTrigger style={styles.selectTrigger}>
                    <SelectValue
                      placeholder={t("reminders:createReminderDrawer.placeholders.type")}
                    />
                  </SelectTrigger>
                  <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                    {REMINDER_TYPES.map((type) => (
                      <SelectItem key={type} value={type} label={t(`reminders:types.${type}`)} />
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="repeatType">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("reminders:createReminderDrawer.fields.repeat")}
                </Text>
                <Select
                  containerStyle={styles.selectContainer}
                  value={{
                    value: field.state.value,
                    label: t(`reminders:repeatTypes.${field.state.value}`),
                  }}
                  onValueChange={(option) => {
                    const next = REPEAT_TYPES.find((type) => type === option?.value);
                    if (next) field.handleChange(next);
                  }}
                >
                  <SelectTrigger style={styles.selectTrigger}>
                    <SelectValue
                      placeholder={t("reminders:createReminderDrawer.placeholders.repeat")}
                    />
                  </SelectTrigger>
                  <SelectContent portalHost={SELECT_PORTAL_HOST} sideOffset={6}>
                    {REPEAT_TYPES.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        label={t(`reminders:repeatTypes.${type}`)}
                      />
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.repeatType}>
            {(repeatType) => (
              <>
                {repeatType === RepeatType.Weekly && (
                  <form.Field name="days">
                    {(field) => {
                      const selectedDays = field.state.value ?? [];
                      return (
                        <View style={styles.field}>
                          <Text style={styles.label}>
                            {t("reminders:createReminderDrawer.fields.days")}
                          </Text>
                          <View style={styles.chips}>
                            {DAY_ORDER.map((day) => {
                              const isSelected = selectedDays.includes(day);
                              return (
                                <Chip
                                  key={day}
                                  label={t(`reminders:days.${day}`)}
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
                )}

                {(repeatType === RepeatType.Once || repeatType === RepeatType.Monthly) && (
                  <form.Field name="date">
                    {(field) => (
                      <View style={styles.field}>
                        <DateTimeField
                          mode="date"
                          label={t("reminders:createReminderDrawer.fields.date")}
                          placeholder={t("reminders:createReminderDrawer.placeholders.date")}
                          value={field.state.value ? dayjs(field.state.value).toDate() : null}
                          display={(date) => dayjs(date).format("DD/MM/YYYY")}
                          minimumDate={new Date()}
                          error={field.state.meta.errors.length > 0}
                          onChange={(date) => field.handleChange(dayjs(date).format("YYYY-MM-DD"))}
                          onBlur={field.handleBlur}
                          containerStyle={styles.inputSurface}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </View>
                    )}
                  </form.Field>
                )}
              </>
            )}
          </form.Subscribe>

          <form.Field name="time">
            {(field) => (
              <View style={styles.field}>
                <DateTimeField
                  mode="time"
                  label={t("reminders:createReminderDrawer.fields.time")}
                  placeholder={t("reminders:createReminderDrawer.placeholders.time")}
                  value={field.state.value ? parseTimeOfDay(field.state.value) : null}
                  display={formatTimeOfDay}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(formatTimeOfDay(date))}
                  onBlur={field.handleBlur}
                  containerStyle={styles.inputSurface}
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
                disabled={!canSubmit || isReminderSaving}
                isLoading={isSubmitting || isReminderSaving}
                onPress={() => form.handleSubmit()}
              >
                {t(
                  isEditMode
                    ? "reminders:editReminderDrawer.submit"
                    : "reminders:createReminderDrawer.submit"
                )}
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
    paddingTop: theme.spacing(4),
    flex: 1,
  },
  content: {
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(DRAWER_FOOTER_FADE_SPACING),
  },
  field: {
    gap: theme.spacing(1),
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  inputSurface: {
    backgroundColor: theme.palette.white,
  },
  textArea: {
    alignItems: "stretch",
    minHeight: theme.spacing(30),
  },
  textAreaInput: {
    paddingVertical: theme.spacing(2),
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
