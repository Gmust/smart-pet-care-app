import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";

import type { ActivityLogResponseDto, PatchActivityLogDto } from "@/api/generated";
import { ActivitySource } from "@/api/generated";
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
import { Text } from "@/shadecn/ui/text";

import { ActivityLocationField } from "../../components/ActivityLocationField";
import { ACTIVITY_INTENSITIES, ACTIVITY_TYPE_ICON, ACTIVITY_TYPES } from "../../constants";
import { useCreateActivityLogMutation } from "../../queries/useCreateActivityLogMutation";
import { useUpdateActivityLogMutation } from "../../queries/useUpdateActivityLogMutation";
import { type ActivityFormValues, activityLogSchema } from "../../schemas/activity-log.schema";
import type { ActivityCoordinates } from "../../types";
import { decodeActivityLocation, encodeActivityLocation } from "../../utils/activityLocation";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  petId: string;
  /** Edit mode: prefills from an existing log and PATCHes it on submit. */
  activity?: ActivityLogResponseDto;
};

const toFormValues = (activity: ActivityLogResponseDto | undefined): ActivityFormValues => ({
  type: activity?.type ?? "",
  recordedAt: activity?.recordedAt ?? new Date().toISOString(),
  intensity: activity?.intensity ?? "",
  durationMinutes: activity?.durationMinutes != null ? String(activity.durationMinutes) : "",
  steps: activity?.steps != null ? String(activity.steps) : "",
  locationLabel: decodeActivityLocation(activity?.location)?.label ?? "",
  note: activity?.note ?? "",
});

/** Blank optional fields are sent as null — a 0 would claim "measured zero". */
const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
};

export const CreateActivityDrawer = ({ isOpen, setIsOpen, petId, activity }: Props) => {
  const { t } = useTranslation(["activity", "common"]);

  const isEditMode = !!activity;

  const [coordinates, setCoordinates] = useState<ActivityCoordinates | null>(
    decodeActivityLocation(activity?.location)?.coordinates ?? null
  );

  const { mutateAsync: createActivity, isPending: isCreating } = useCreateActivityLogMutation();
  const { mutateAsync: updateActivity, isPending: isUpdating } = useUpdateActivityLogMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues: toFormValues(activity),
    validators: {
      onChange: activityLogSchema(t, { requireIntensity: isEditMode }),
      onSubmit: activityLogSchema(t, { requireIntensity: isEditMode }),
    },
    onSubmit: async ({ value }) => {
      if (!value.type) return;

      const location = encodeActivityLocation(
        value.locationLabel.trim() !== "" || coordinates !== null
          ? { label: value.locationLabel, coordinates }
          : null
      );

      try {
        if (isEditMode) {
          // A log the API returned without an id cannot be PATCHed. Falling
          // through would POST a duplicate and still report "Activity updated".
          if (!activity?.id) {
            Toast.show({ type: "error", text1: t("activity:forms.activity.missingId") });
            return;
          }

          // PATCH semantics: an omitted key is left unchanged, null clears it.
          // Only send what actually changed so a concurrent edit elsewhere is
          // not silently overwritten with stale form values.
          const dto: PatchActivityLogDto = {};

          if (value.type !== activity.type) dto.type = value.type;
          if (value.recordedAt !== activity.recordedAt) dto.recordedAt = value.recordedAt;

          // The DTO types these as `number | string | null` (the spec gives
          // them a numeric string pattern), so compare numbers — a raw !==
          // against a stringified value re-sends the field on every edit.
          const duration = toNullableNumber(value.durationMinutes);
          if (duration !== toNullableNumber(String(activity.durationMinutes ?? ""))) {
            dto.durationMinutes = duration;
          }

          const steps = toNullableNumber(value.steps);
          if (steps !== toNullableNumber(String(activity.steps ?? ""))) dto.steps = steps;

          // Compare like for like: the stored value may use another valid
          // spelling of the same place ("Park@1,2"), and encoding normalises it
          // to 6 decimals. A raw string compare would resend an untouched
          // location and clobber a concurrent edit.
          const currentLocation = encodeActivityLocation(decodeActivityLocation(activity.location));
          if (location !== currentLocation) dto.location = location;

          const note = value.note.trim() || null;
          if (note !== (activity.note ?? null)) dto.note = note;

          // The spec models intensity as a bare enum with no null member, so it
          // cannot be cleared — the edit form requires one, which keeps this to
          // a change between real values.
          if (value.intensity && value.intensity !== activity.intensity) {
            dto.intensity = value.intensity;
          }

          await updateActivity({ petId, activityLogId: activity.id, dto });
        } else {
          await createActivity({
            petId,
            dto: {
              type: value.type,
              recordedAt: value.recordedAt,
              intensity: value.intensity || null,
              durationMinutes: toNullableNumber(value.durationMinutes),
              steps: toNullableNumber(value.steps),
              location,
              note: value.note.trim() || null,
              source: ActivitySource.Manual,
            },
          });
        }

        Toast.show({
          type: "success",
          text1: t(
            isEditMode
              ? "activity:forms.activity.updateSuccess"
              : "activity:forms.activity.createSuccess"
          ),
        });
        form.reset();
        if (!isEditMode) setCoordinates(null);
        setIsOpen(false);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
  });

  // Create mode stays mounted for the life of the tab, so an abandoned draft
  // (note, pin) would otherwise reappear on the next open. Edit mode is keyed
  // by activity id and re-seeds on mount instead.
  useEffect(() => {
    if (isOpen || isEditMode) return;
    form.reset();
    setCoordinates(null);
  }, [isOpen, isEditMode, form]);

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
          <DrawerTitle>
            {t(
              isEditMode
                ? "activity:forms.activity.editTitle"
                : "activity:forms.activity.createTitle"
            )}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="type">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("activity:forms.activity.fields.type")}</Text>
                <View style={styles.chips}>
                  {ACTIVITY_TYPES.map((type) => {
                    const isSelected = field.state.value === type;
                    return (
                      <Chip
                        key={type}
                        label={t(`activity:types.${type}`)}
                        icon={ACTIVITY_TYPE_ICON[type]}
                        tone={isSelected ? "primary" : "neutral"}
                        variant={isSelected ? "default" : "ghost"}
                        onPress={() => field.handleChange(type)}
                      />
                    );
                  })}
                </View>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="recordedAt">
            {(field) => {
              // DateTimeField has no combined datetime mode, so date and time are
              // edited separately and merged back into the one ISO value.
              const current = field.state.value ? dayjs(field.state.value) : dayjs();
              const hasError = field.state.meta.errors.length > 0;

              return (
                <View style={styles.field}>
                  <Text style={styles.label}>{t("activity:forms.activity.fields.recordedAt")}</Text>
                  <View style={styles.row}>
                    <View style={styles.rowItem}>
                      <DateTimeField
                        mode="date"
                        placeholder={t("activity:forms.activity.placeholders.recordedAt")}
                        value={field.state.value ? current.toDate() : null}
                        display={(date) => dayjs(date).format("MMM D, YYYY")}
                        maximumDate={new Date()}
                        error={hasError}
                        onChange={(date) =>
                          field.handleChange(
                            current
                              .year(dayjs(date).year())
                              .month(dayjs(date).month())
                              .date(dayjs(date).date())
                              .toISOString()
                          )
                        }
                        onBlur={field.handleBlur}
                      />
                    </View>
                    <View style={styles.rowItem}>
                      <DateTimeField
                        mode="time"
                        placeholder={t("activity:forms.activity.placeholders.recordedAtTime")}
                        value={field.state.value ? current.toDate() : null}
                        display={(date) => dayjs(date).format("HH:mm")}
                        error={hasError}
                        onChange={(date) =>
                          field.handleChange(
                            current
                              .hour(dayjs(date).hour())
                              .minute(dayjs(date).minute())
                              .second(0)
                              .millisecond(0)
                              .toISOString()
                          )
                        }
                        onBlur={field.handleBlur}
                      />
                    </View>
                  </View>
                  <FieldError errors={field.state.meta.errors} />
                </View>
              );
            }}
          </form.Field>

          <form.Field name="intensity">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>{t("activity:forms.activity.fields.intensity")}</Text>
                <View style={styles.chips}>
                  {ACTIVITY_INTENSITIES.map((intensity) => {
                    const isSelected = field.state.value === intensity;
                    return (
                      <Chip
                        key={intensity}
                        label={t(`activity:intensities.${intensity}`)}
                        tone={isSelected ? "primary" : "neutral"}
                        variant={isSelected ? "default" : "ghost"}
                        onPress={() =>
                          field.handleChange(isSelected && !isEditMode ? "" : intensity)
                        }
                      />
                    );
                  })}
                </View>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="durationMinutes">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("activity:forms.activity.fields.durationMinutes")}
                  placeholder={t("activity:forms.activity.placeholders.durationMinutes")}
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

          <form.Field name="steps">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("activity:forms.activity.fields.steps")}
                  placeholder={t("activity:forms.activity.placeholders.steps")}
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

          <form.Field name="locationLabel">
            {(field) => (
              <ActivityLocationField
                label={field.state.value}
                onChangeLabel={field.handleChange}
                coordinates={coordinates}
                onChangeCoordinates={setCoordinates}
              />
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("activity:forms.activity.fields.note")}
                  placeholder={t("activity:forms.activity.placeholders.note")}
                  multiline
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
                size="lg"
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isSaving}
                isLoading={isSubmitting || isSaving}
                onPress={() => form.handleSubmit()}
              >
                {t("activity:forms.activity.submit")}
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
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(20),
    paddingHorizontal: theme.spacing(4),
  },
  field: {
    gap: theme.spacing(1.5),
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
  row: {
    flexDirection: "row",
    gap: theme.spacing(3),
  },
  rowItem: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    paddingTop: theme.spacing(1),
    backgroundColor: "transparent",
  },
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
