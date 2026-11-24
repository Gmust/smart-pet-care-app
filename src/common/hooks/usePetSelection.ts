import { useContext } from "react";

import { PetSelectionContext } from "@/common/providers/PetSelectionProvider";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";

export const usePetSelection = () => {
  const context = useContext(PetSelectionContext);
  if (!context) throw new Error("usePetSelection must be used within PetSelectionProvider.");

  const { data: pets, isLoading, isError, refetch } = usePetsQuery();
  const selectedPet = pets?.find((pet) => pet.id === context.chosenPetId) ?? pets?.[0];

  return {
    pets,
    isLoading,
    isError,
    refetch,
    selectedPet,
    selectedPetId: selectedPet?.id,
    setSelectedPetId: context.setChosenPetId,
  };
};
