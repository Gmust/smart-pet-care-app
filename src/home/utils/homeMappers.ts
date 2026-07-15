import type { PetResponseDto } from "@/api/generated";

import type { PetHealth } from "../types";

const getPetScore = (pet: PetResponseDto): number => {
  if (pet.allergies || pet.chronicConditions) {
    return 68;
  }

  return 88;
};

export const toPetHealth = (pet: PetResponseDto): PetHealth => {
  const hasCareNotes = Boolean(pet.allergies || pet.chronicConditions || pet.behavioralNotes);
  const weight =
    pet.weightKg !== null && pet.weightKg !== undefined ? `${pet.weightKg} kg` : "Not added";

  return {
    id: pet.id ?? pet.name ?? "pet",
    petName: pet.name ?? "Unnamed pet",
    score: getPetScore(pet),
    status: hasCareNotes ? "Needs attention — review care notes" : "Stable — no issues logged",
    trendLabel: hasCareNotes ? "Watch" : "Stable",
    signals: {
      weight: { value: weight, status: pet.weightKg ? "ok" : "warn" },
      appetite: { value: "Not tracked", status: "warn" },
      activity: {
        value: pet.updatedAt ? "Updated" : "Not tracked",
        status: pet.updatedAt ? "ok" : "warn",
      },
    },
  };
};
