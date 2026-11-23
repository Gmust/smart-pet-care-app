import type { PetResponseDto, UpdatePetDto } from "@/api/generated";

import { BASICS_SEGMENTS } from "../constants";
import type { EditBasicsForm } from "../schemas/edit-basics.schema";

// Entries trimmed, blank rows dropped; an empty list is `null`, which the server stores as "none".
export const toList = (values: string[] | null | undefined): string[] | null => {
  const list = (values ?? []).map((value) => value.trim()).filter(Boolean);
  return list.length > 0 ? list : null;
};

// PATCH: an omitted key is left unchanged and `null` clears the list. Only the lists that changed
// are sent, so a stale form cannot overwrite a concurrent edit of another one.
export const buildBasicsPatch = (values: EditBasicsForm, pet: PetResponseDto): UpdatePetDto => {
  const dto: UpdatePetDto = {};

  for (const key of BASICS_SEGMENTS) {
    const next = toList(values[key]);
    if (JSON.stringify(next) !== JSON.stringify(toList(pet[key]))) dto[key] = next;
  }

  return dto;
};
