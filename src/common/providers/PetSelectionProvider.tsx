import { createContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type PetSelectionContextValue = {
  /** What the user picked. It can name a pet that is gone, so read the pet through `usePetSelection`. */
  chosenPetId: string | undefined;
  setChosenPetId: (petId: string | undefined) => void;
};

export const PetSelectionContext = createContext<PetSelectionContextValue | null>(null);

export const PetSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [chosenPetId, setChosenPetId] = useState<string | undefined>(undefined);

  const value = useMemo(() => ({ chosenPetId, setChosenPetId }), [chosenPetId]);

  return <PetSelectionContext.Provider value={value}>{children}</PetSelectionContext.Provider>;
};
