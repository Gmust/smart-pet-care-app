import type { PetResponseDto } from "@/api/generated";

import type { PetHealth } from "../types";

export const toPetHealth = (pet: PetResponseDto): PetHealth => ({
  id: pet.id ?? pet.name ?? "pet",
  petName: pet.name ?? "Unnamed pet",
  species: pet.species ?? null,
  photoUrl: pet.photoUrl ?? null,
});
