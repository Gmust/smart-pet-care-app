import { useMemo } from "react";

import { usePetsQuery } from "@/pets/queries/usePetsQuery";

export const usePetNames = () => {
  const { data: pets } = usePetsQuery();

  return useMemo(
    () =>
      new Map(
        (pets ?? []).flatMap((pet) => (pet.id && pet.name ? [[pet.id, pet.name] as const] : []))
      ),
    [pets]
  );
};
