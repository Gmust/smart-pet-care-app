import type { TFunction } from "i18next";
import { z } from "zod/v4";

import { Sex } from "@/api/generated";

const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

export const optionalTextList = z.array(z.string()).transform((values) => {
  const normalizedValues = values.map((value) => value.trim()).filter((value) => value.length > 0);

  return normalizedValues.length > 0 ? normalizedValues : null;
});

export const createPetSchema = (t: TFunction<"pets">) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    species: z.string().trim().min(1, t("validation.speciesRequired")),
    breed: optionalText,
    // The server may answer with "Z", an offset ("...+00:00") or no zone at all; all are valid.
    birthDate: z.iso
      .datetime({ offset: true, local: true, error: t("validation.birthDateInvalid") })
      .nullish(),
    weightKg: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (!value) {
          ctx.addIssue({ code: "custom", message: t("validation.weightRequired") });
          return z.NEVER;
        }

        const parsed = Number(value.replace(",", "."));
        if (Number.isNaN(parsed) || parsed <= 0) {
          ctx.addIssue({ code: "custom", message: t("validation.weightInvalid") });
          return z.NEVER;
        }

        return parsed;
      }),
    sex: z.enum(Sex).default(Sex.Unknown),
    allergies: optionalTextList,
    chronicConditions: optionalTextList,
    behavioralNotes: optionalTextList,
  });

type CreatePetSchema = ReturnType<typeof createPetSchema>;
export type CreatePetForm = z.input<CreatePetSchema>;

export const createPetStepOneSchema = (t: TFunction<"pets">) =>
  createPetSchema(t).pick({ name: true, species: true, weightKg: true });

// Edit has no weight: `UpdatePetDto` takes no `weightKg`, so weight changes only through the
// weight log (create seeds the first entry).
export const editPetSchema = (t: TFunction<"pets">) =>
  createPetSchema(t).omit({
    weightKg: true,
    allergies: true,
    chronicConditions: true,
    behavioralNotes: true,
  });

export type EditPetForm = z.input<ReturnType<typeof editPetSchema>>;
