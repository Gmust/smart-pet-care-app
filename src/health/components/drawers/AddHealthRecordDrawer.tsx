import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";

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

import { useCreateHealthRecordMutation } from "../../queries/useCreateHealthRecordMutation";
import { useSymptomsQuery } from "../../queries/useSymptomsQuery";
import {
  type HealthRecordFormValues,
  healthRecordSchema,
} from "../../schemas/health-record.schema";
import type { HealthHistoryCategory } from "../../types";

type Props = {
  petId: string;
  type: HealthHistoryCategory;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const defaultValues: HealthRecordFormValues = {
  title: "",
  performedAt: "",
  description: "",
  nextDueAt: "",
  dosage: "",
  provider: "",
  symptoms: [],
};

export function AddHealthRecordDrawer({ petId, type, isOpen, setIsOpen }: Props) {
  const { t } = useTranslation(["health", "common"]);

  const { mutateAsync: createRecord, isPending } = useCreateHealthRecordMutation();
  const { data: symptomCatalog } = useSymptomsQuery();

  const form = useForm({
    defaultValues,
    validators: { onChange: healthRecordSchema(t), onSubmit: healthRecordSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        await createRecord({
          petId,
          dto: {
            type,
            title: value.title,
            performedAt: value.performedAt,
            description: value.description || null,
            nextDueAt: value.nextDueAt || null,
            dosage: value.dosage || null,
            provider: value.provider || null,
            symptoms: value.symptoms.length ? value.symptoms : null,
          },
        });
        Toast.show({ type: "success", text1: t("health:forms.healthRecord.createSuccess") });
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
        snapPoints={["90%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>
            {t("health:forms.healthRecord.createTitle", {
              category: t(`health:categoryLabels.${type}`),
            })}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
        >
          <form.Field name="title">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("health:forms.healthRecord.fields.title")}
                  placeholder={t("health:forms.healthRecord.placeholders.title")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="performedAt">
            {(field) => (
              <View style={styles.field}>
                <DateTimeField
                  mode="date"
                  label={t("health:forms.healthRecord.fields.performedAt")}
                  placeholder={t("health:forms.healthRecord.placeholders.performedAt")}
                  value={field.state.value ? new Date(field.state.value) : null}
                  display={(date) => dayjs(date).format("MMM D, YYYY")}
                  maximumDate={new Date()}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(date.toISOString())}
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="provider">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("health:forms.healthRecord.fields.provider")}
                  placeholder={t("health:forms.healthRecord.placeholders.provider")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="dosage">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("health:forms.healthRecord.fields.dosage")}
                  placeholder={t("health:forms.healthRecord.placeholders.dosage")}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="nextDueAt">
            {(field) => (
              <View style={styles.field}>
                <DateTimeField
                  mode="date"
                  label={t("health:forms.healthRecord.fields.nextDueAt")}
                  placeholder={t("health:forms.healthRecord.placeholders.nextDueAt")}
                  value={field.state.value ? new Date(field.state.value) : null}
                  display={(date) => dayjs(date).format("MMM D, YYYY")}
                  minimumDate={new Date()}
                  error={field.state.meta.errors.length > 0}
                  onChange={(date) => field.handleChange(date.toISOString())}
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </View>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <View style={styles.field}>
                <Input
                  label={t("health:forms.healthRecord.fields.description")}
                  placeholder={t("health:forms.healthRecord.placeholders.description")}
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

          {!!symptomCatalog?.length && (
            <form.Field name="symptoms">
              {(field) => {
                const selected = field.state.value;
                return (
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      {t("health:forms.healthRecord.fields.symptoms")}
                    </Text>
                    <View style={styles.chips}>
                      {symptomCatalog.map((symptom) => {
                        const isSelected = !!symptom.name && selected.includes(symptom.name);
                        return (
                          <Chip
                            key={symptom.id}
                            label={symptom.label ?? symptom.name ?? ""}
                            tone={isSelected ? "primary" : "neutral"}
                            variant={isSelected ? "default" : "ghost"}
                            onPress={() => {
                              if (!symptom.name) return;
                              field.handleChange(
                                isSelected
                                  ? selected.filter((value) => value !== symptom.name)
                                  : [...selected, symptom.name]
                              );
                            }}
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
        </DrawerScrollView>

        <DrawerFooter style={styles.footer}>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                size="lg"
                variant="primary"
                style={styles.submitButton}
                disabled={!canSubmit || isPending}
                isLoading={isSubmitting || isPending}
                onPress={() => form.handleSubmit()}
              >
                {t("health:forms.healthRecord.submit")}
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
    gap: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(20),
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    backgroundColor: "transparent",
  },
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
