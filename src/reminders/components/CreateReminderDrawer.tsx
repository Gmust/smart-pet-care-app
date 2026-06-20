import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import { DaysOfWeek, ReminderType } from "@/api/generated";
import { DateTimeField } from "@/common/components/DateTimeField";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";
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
import { Switch } from "@/shadecn/ui/switch";
import { Text } from "@/shadecn/ui/text";

import { useCreateRemindersMutation } from "../queries/useCreateRemindersMutation";
import { type CreateReminderForm, createReminderSchema } from "../schemas/create-reminder.schema";
import { ReminderPetSelectSkeleton } from "../skeletons/CreateReminderDrawerSkeleton";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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
const SELECT_PORTAL_HOST = "select";

const parseTime = (value: string): Date => {
  const date = new Date();
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const defaultValues: CreateReminderForm = {
  petId: "",
  title: "",
  description: null,
  type: ReminderType.Feeding,
  days: [],
  isRepeatable: false,
  time: "",
  endAt: null,
};

export const CreateReminderDrawer = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation(["reminders", "common"]);
  const { data: pets, isLoading: isPetsLoading } = usePetsQuery();

  const { mutateAsync: createReminder, isPending: isReminderCreating } =
    useCreateRemindersMutation();

  const form = useForm({
    defaultValues,
    validators: { onChange: createReminderSchema(t), onSubmit: createReminderSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        await createReminder(value);
        Toast.show({ type: "success", text1: t("reminders:successMessage") });
        form.reset();
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
        snapPoints={["94%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropPressBehavior="none"
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>
            {t("reminders:createReminderDrawer.title")}
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

          <form.Field name="isRepeatable">
            {(field) => {
              const isRepeatable = field.state.value ?? false;
              return (
                <Pressable
                  style={styles.switchRow}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isRepeatable }}
                  onPress={() => field.handleChange(!isRepeatable)}
                >
                  <Text style={styles.label}>
                    {t("reminders:createReminderDrawer.fields.repeat")}
                  </Text>
                  <Switch checked={isRepeatable} onCheckedChange={field.handleChange} />
                </Pressable>
              );
            }}
          </form.Field>

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

          <form.Field name="time">
            {(field) => (
              <View style={styles.field}>
                <DateTimeField
                  mode="time"
                  label={t("reminders:createReminderDrawer.fields.time")}
                  placeholder={t("reminders:createReminderDrawer.placeholders.time")}
                  value={field.state.value ? parseTime(field.state.value) : null}
                  display={formatTime}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(formatTime(date))}
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
                disabled={!canSubmit || isReminderCreating}
                isLoading={isSubmitting || isReminderCreating}
                onPress={() => form.handleSubmit()}
              >
                {t("reminders:createReminderDrawer.submit")}
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: theme.spacing(12),
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(4),
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
