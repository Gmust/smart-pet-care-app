import { Sex } from "@/api/generated";

import type { TFunction } from "i18next";
import { z } from "zod/v4";

const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

export const createPetSchema = (t: TFunction<"pets">) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    species: z.string().trim().min(1, t("validation.speciesRequired")),
    breed: optionalText,
    birthDate: z.iso.datetime(t("validation.birthDateInvalid")).nullish(),
    weightKg: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (!value) {
          return null;
        }

        const parsed = Number(value.replace(",", "."));
        if (Number.isNaN(parsed) || parsed <= 0) {
          ctx.addIssue({ code: "custom", message: t("validation.weightInvalid") });
          return z.NEVER;
        }

        return parsed;
      }),
    sex: z.enum(Sex).default(Sex.Unknown),
    allergies: optionalText,
    chronicConditions: optionalText,
    behavioralNotes: optionalText,
  });

type CreatePetSchema = ReturnType<typeof createPetSchema>;
export type CreatePetForm = z.input<CreatePetSchema>;
