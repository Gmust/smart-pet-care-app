import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";

import type { HealthRecordResponseDto } from "@/api/generated";
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
import { Text } from "@/shadecn/ui/text";

import {
  HEALTH_CATEGORY_ICON,
  HEALTH_CATEGORY_TITLE_PLACEHOLDER_KEYS,
  HEALTH_FORM_CATEGORIES,
} from "../../constants";
import { useCreateHealthRecordMutation } from "../../queries/useCreateHealthRecordMutation";
import { useSymptomsQuery } from "../../queries/useSymptomsQuery";
import { useUpdateHealthRecordMutation } from "../../queries/useUpdateHealthRecordMutation";
import {
  type HealthRecordFormValues,
  healthRecordSchema,
} from "../../schemas/health-record.schema";
import { formCategorySchema } from "../../schemas/health-record-list-params.schema";
import type { HealthRecordFormCategory } from "../../types";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Pins the pet — skips the pet-picker step. Ignored when `record` is set. */
  petId?: string;
  /** Pins the record type — skips the type-picker step. Ignored when `record` is set. */
  type?: HealthRecordFormCategory;
  /** Edit mode: prefills the form from an existing record and updates it on submit. */
  record?: HealthRecordResponseDto;
};

const SELECT_PORTAL_HOST = "select";

// Single call site, kept as a named function anyway (deliberate exception to
// the no-single-use-helper rule): the explicit `: HealthRecordFormValues`
// return type catches a missing/mistyped field right here, at the priority
// merge itself, instead of downstream wherever the form value is consumed.
const getDefaultValues = (
  petId: string | undefined,
  type: HealthRecordFormCategory | undefined,
  record: HealthRecordResponseDto | undefined
): HealthRecordFormValues => ({
  petId: record?.petId ?? petId ?? "",
  // record.type is HealthRecordType (the full backend enum), which is wider
  // than what this form can edit (Medication, Surgery, HealthNote exist
  // server-side). Narrowed without a cast; edit mode is only reachable from the
  // record list, which only queries form categories.
  type: formCategorySchema.safeParse(record?.type).data ?? type ?? "",
  title: record?.title ?? "",
  performedAt: record?.performedAt ?? "",
  description: record?.description ?? "",
  nextDueAt: record?.nextDueAt ?? "",
  dosage: record?.dosage ?? "",
  provider: record?.provider ?? "",
  symptoms: record?.symptoms ?? [],
});

export function AddHealthRecordDrawer({ petId, type, record, isOpen, setIsOpen }: Props) {
  const { t } = useTranslation(["health", "common"]);

  const isEditMode = !!record;
  const defaultValues = getDefaultValues(petId, type, record);
  // Edit mode never offers the pet or type steps: moving or re-typing an
  // existing record is not an edit this form supports.
  const showPetStep = !record && !defaultValues.petId;
  const showTypeStep = !record && !defaultValues.type;

  const { data: pets, isLoading: isPetsLoading } = usePetsQuery();
  const { mutateAsync: createRecord, isPending: isCreating } = useCreateHealthRecordMutation();
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdateHealthRecordMutation();
  const { data: symptomCatalog } = useSymptomsQuery();
  const isSaving = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: { onChange: healthRecordSchema(t), onSubmit: healthRecordSchema(t) },
    onSubmit: async ({ value }) => {
      if (!value.type) return;
      try {
        if (isEditMode && record?.id) {
          // PATCH leaves an omitted key unchanged, so send only what the user
          // changed — a stale form must not overwrite someone else's newer edit.
          // `type` is never sent, so an edit cannot re-type a record.
          const changed = (key: keyof HealthRecordFormValues) =>
            JSON.stringify(value[key]) !== JSON.stringify(defaultValues[key]);
          await updateRecord({
            petId: value.petId,
            recordId: record.id,
            dto: {
              ...(changed("title") ? { title: value.title } : {}),
              ...(changed("performedAt") ? { performedAt: value.performedAt } : {}),
              ...(changed("description") ? { description: value.description || null } : {}),
              ...(changed("dosage") ? { dosage: value.dosage || null } : {}),
              ...(changed("provider") ? { provider: value.provider || null } : {}),
              ...(changed("symptoms")
                ? { symptoms: value.symptoms.length ? value.symptoms : null }
                : {}),
              // PatchHealthRecordDto's nextDueAt can't be cleared via null
              // (unlike create), so an emptied date is not sent at all.
              ...(changed("nextDueAt") && value.nextDueAt ? { nextDueAt: value.nextDueAt } : {}),
            },
          });
        } else {
          await createRecord({
            petId: value.petId,
            dto: {
              type: value.type,
              title: value.title,
              performedAt: value.performedAt,
              description: value.description || null,
              dosage: value.dosage || null,
              provider: value.provider || null,
              symptoms: value.symptoms.length ? value.symptoms : null,
              nextDueAt: value.nextDueAt || null,
            },
          });
        }

        Toast.show({
          type: "success",
          text1: t(
            isEditMode
              ? "health:forms.healthRecord.updateSuccess"
              : "health:forms.healthRecord.createSuccess"
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

  // Runs on every open, not just on mount: callers like the Fab keep the drawer
  // mounted, and the reset after a save clears petId. With one pet the picker
  // is hidden, so without this the next save is blocked by an invisible error.
  useEffect(() => {
    if (!isOpen || !showPetStep || isPetsLoading || pets?.length !== 1) return;
    const onlyPetId = pets[0].id;
    if (onlyPetId && !form.getFieldValue("petId")) {
      form.setFieldValue("petId", onlyPetId);
    }
  }, [isOpen, showPetStep, isPetsLoading, pets, form]);

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

        <form.Subscribe selector={(state) => state.values.type}>
          {(selectedType) => (
            <>
              <DrawerHeader style={styles.header}>
                <DrawerTitle>
                  {!selectedType
                    ? t("health:forms.healthRecord.createTitleGeneric")
                    : t(
                        isEditMode
                          ? "health:forms.healthRecord.editTitle"
                          : "health:forms.healthRecord.createTitle",
                        { category: t(`health:categoryLabels.${selectedType}`) }
                      )}
                </DrawerTitle>
              </DrawerHeader>

              <DrawerScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator
              >
                {showPetStep && !isPetsLoading && (pets?.length ?? 0) > 1 && (
                  <form.Field name="petId">
                    {(field) => {
                      const selected = pets?.find((pet) => pet.id === field.state.value);
                      return (
                        <View style={styles.field}>
                          <Text style={styles.label}>
                            {t("health:forms.healthRecord.fields.pet")}
                          </Text>
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
                                placeholder={t("health:forms.healthRecord.placeholders.pet")}
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
                          <FieldError errors={field.state.meta.errors} />
                        </View>
                      );
                    }}
                  </form.Field>
                )}

                {showTypeStep && (
                  <form.Field name="type">
                    {(field) => (
                      <View style={styles.field}>
                        <Text style={styles.label}>
                          {t("health:forms.healthRecord.fields.type")}
                        </Text>
                        <View style={styles.chips}>
                          {HEALTH_FORM_CATEGORIES.map((category) => {
                            const isSelected = field.state.value === category;
                            return (
                              <Chip
                                key={category}
                                label={t(`health:categoryLabels.${category}`)}
                                icon={HEALTH_CATEGORY_ICON[category]}
                                tone={isSelected ? "primary" : "neutral"}
                                variant={isSelected ? "default" : "ghost"}
                                onPress={() => field.handleChange(category)}
                              />
                            );
                          })}
                        </View>
                        <FieldError errors={field.state.meta.errors} />
                      </View>
                    )}
                  </form.Field>
                )}

                {!selectedType ? null : (
                  <>
                    <form.Field name="title">
                      {(field) => (
                        <View style={styles.field}>
                          <Input
                            label={t("health:forms.healthRecord.fields.title")}
                            placeholder={t(HEALTH_CATEGORY_TITLE_PLACEHOLDER_KEYS[selectedType])}
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

                    {selectedType === "VetVisit" && (
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
                    )}

                    {selectedType === "VetVisit" || selectedType === "Symptom" ? (
                      <>
                        <form.Field name="description">
                          {(field) => (
                            <View style={styles.field}>
                              <Input
                                label={t("health:forms.healthRecord.fields.description")}
                                placeholder={t(
                                  selectedType === "Symptom"
                                    ? "health:forms.healthRecord.placeholders.descriptionSymptom"
                                    : "health:forms.healthRecord.placeholders.description"
                                )}
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
                                      const isSelected =
                                        !!symptom.name && selected.includes(symptom.name);
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
                      </>
                    ) : (
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
                    )}
                  </>
                )}
              </DrawerScrollView>
            </>
          )}
        </form.Subscribe>

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
  submitButton: {
    marginHorizontal: theme.spacing(4),
  },
}));
