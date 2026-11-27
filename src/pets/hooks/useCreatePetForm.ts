import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useForm } from "@tanstack/react-form";

import { AnimalSpecies, type PetResponseDto, Sex } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { useCreatePetMutation } from "@/pets/queries/useCreatePetMutation";
import type { CreatePetForm } from "@/pets/schemas/create-pet.schema";
import { createPetSchema } from "@/pets/schemas/create-pet.schema";

const defaultValues: CreatePetForm = {
  name: "",
  species: "",
  breed: "",
  birthDate: null,
  weightKg: "",
  sex: Sex.Unknown,
  allergies: [],
  chronicConditions: [],
  behavioralNotes: [],
};

export const useCreatePetForm = (onCreated: (pet: PetResponseDto) => void) => {
  const { t } = useTranslation(["pets", "common"]);
  const { mutateAsync: createPet } = useCreatePetMutation();

  const form = useForm({
    defaultValues,
    validators: { onChange: createPetSchema(t), onSubmit: createPetSchema(t) },
    onSubmit: async ({ value }) => {
      try {
        const species = Object.values(AnimalSpecies).find(
          (animalSpecies) => animalSpecies === value.species
        );
        if (!species) {
          Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
          return;
        }

        // Send the schema output: it drops blank list rows and reads "3,5" as 3.5.
        const parsed = createPetSchema(t).parse(value);
        const createdPet = await createPet({ ...parsed, species });
        Toast.show({ type: "success", text1: t("pets:successMessage") });
        form.reset();
        onCreated(createdPet);
      } catch (e) {
        console.error(e);
        setApiFieldErrors(form, e);
        Toast.show({ type: "error", text1: getApiErrorMessage(e) });
      }
    },
  });

  return form;
};

export type CreatePetFormApi = ReturnType<typeof useCreatePetForm>;
