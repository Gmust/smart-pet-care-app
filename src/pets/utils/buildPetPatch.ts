import type { PetResponseDto, UpdatePetDto } from "@/api/generated";
import { AnimalSpecies, Sex } from "@/api/generated";

import type { EditPetForm } from "../schemas/create-pet.schema";

// Entries trimmed, blank rows dropped; an empty list is `null`, which the server stores as "none".
const toList = (values: string[] | null | undefined): string[] | null => {
  const list = (values ?? []).map((value) => value.trim()).filter(Boolean);
  return list.length > 0 ? list : null;
};

// PATCH: an omitted key is left unchanged. Send only what changed, or a stale form overwrites a
// concurrent edit. Only the `PatchFieldOf*` lists clear with `null`; for the plain nullable fields
// (name, species, breed, birthDate, sex) the server reads `null` as "not sent", so a blanked breed
// goes out as "" (stored as null). An unchanged species is never resent: the server rejects
// `Unknown` (`pet_species_invalid`), so resending it made a pet saved as `Unknown` uneditable.
export const buildPetPatch = (values: EditPetForm, pet: PetResponseDto): UpdatePetDto => {
  const dto: UpdatePetDto = {};

  const name = values.name.trim();
  // Stored values are trimmed too: the server trims on write, but older rows may not be, and an
  // untouched field must not be resent over a concurrent edit.
  if (name && name !== pet.name?.trim()) dto.name = name;

  const species = Object.values(AnimalSpecies).find((value) => value === values.species);
  if (species && species !== pet.species) dto.species = species;

  const breed = values.breed?.trim() ?? "";
  if (breed !== (pet.breed?.trim() ?? "")) dto.breed = breed;

  const birthDate = values.birthDate ?? null;
  if (birthDate !== (pet.birthDate ?? null)) dto.birthDate = birthDate;

  const sex = values.sex ?? Sex.Unknown;
  if (sex !== (pet.sex ?? Sex.Unknown)) dto.sex = sex;

  const allergies = toList(values.allergies);
  if (JSON.stringify(allergies) !== JSON.stringify(toList(pet.allergies))) {
    dto.allergies = allergies;
  }

  const chronicConditions = toList(values.chronicConditions);
  if (JSON.stringify(chronicConditions) !== JSON.stringify(toList(pet.chronicConditions))) {
    dto.chronicConditions = chronicConditions;
  }

  return dto;
};
