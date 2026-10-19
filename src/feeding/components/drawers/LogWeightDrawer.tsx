import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { PetWeightLogResponseDto } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { Button } from "@/shadecn/ui/button";
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

import { useCreateWeightLogMutation } from "../../queries/useCreateWeightLogMutation";
import { useUpdateWeightLogMutation } from "../../queries/useUpdateWeightLogMutation";
import { type WeightLogFormValues, weightLogSchema } from "../../schemas/weight-log.schema";
import { buildWeightLogCreate } from "../../utils/buildWeightLogCreate";
import { buildWeightLogPatch } from "../../utils/buildWeightLogPatch";
import { toApiNumber } from "../../utils/toApiNumber";
import { DateTimeFieldRow } from "../DateTimeFieldRow";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  petId: string;
  log?: PetWeightLogResponseDto;
};

const toFormValues = (log?: PetWeightLogResponseDto): WeightLogFormValues => ({
  weightKg: String(toApiNumber(log?.weightKg) ?? ""),
  measuredAt: log?.measuredAt ?? new Date().toISOString(),
  notes: log?.notes ?? "",
});

export const LogWeightDrawer = ({ isOpen, setIsOpen, petId, log }: Props) => {
  const { t } = useTranslation(["feeding", "common"]);

  const isEditMode = !!log;

  const { mutateAsync: createLog, isPending: isCreating } = useCreateWeightLogMutation();
  const { mutateAsync: updateLog, isPending: isUpdating } = useUpdateWeightLogMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues: toFormValues(log),
    validators: {
      onChange: weightLogSchema(t),
      onSubmit: weightLogSchema(t),
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode) {
          // An entry without an id cannot be PATCHed; falling through would POST a duplicate and
          // report success.
          if (!log?.id) {
            Toast.show({ type: "error", text1: t("feeding:forms.weight.missingId") });
            return;
          }

          const dto = buildWeightLogPatch(value, log);
          if (Object.keys(dto).length > 0) {
            await updateLog({ petId, weightLogId: log.id, dto });
          }
        } else {
          await createLog({ petId, dto: buildWeightLogCreate(value) });
        }

        Toast.show({
          type: "success",
          text1: t(
            isEditMode ? "feeding:forms.weight.updateSuccess" : "feeding:forms.weight.createSuccess"
          ),
        });
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
    if (!isOpen || isEditMode || form.state.isDirty) return;
    form.reset(toFormValues());
  }, [isOpen, isEditMode, form]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={["72%"]} enableDynamicSizing={false}>
        <DrawerHeader>
          <DrawerTitle>
            {t(isEditMode ? "feeding:forms.weight.editTitle" : "feeding:forms.weight.createTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="measuredAt">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.weight.fields.measuredAt")}
                </Text>
                <DateTimeFieldRow
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                  datePlaceholder={t("feeding:forms.weight.placeholders.measuredAtDate")}
                  timePlaceholder={t("feeding:forms.weight.placeholders.measuredAtTime")}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="weightKg">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.weight.fields.weightKg")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.weight.placeholders.weightKg")}
                  keyboardType="decimal-pad"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <Text variant="caption" style={styles.hint}>
                  {t("feeding:forms.weight.hints.weightKg")}
                </Text>
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <View style={styles.field}>
                <Text variant="bodyS" style={styles.label}>
                  {t("feeding:forms.weight.fields.notes")}
                </Text>
                <Input
                  placeholder={t("feeding:forms.weight.placeholders.notes")}
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
                {t("feeding:forms.weight.submit")}
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
  hint: {
    color: theme.palette.brand.textFaint,
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
