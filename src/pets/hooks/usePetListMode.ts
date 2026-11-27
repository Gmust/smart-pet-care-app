import { useContext } from "react";

import { PetListModeContext } from "../providers/PetListModeProvider";

export const usePetListMode = () => {
  const context = useContext(PetListModeContext);
  if (!context) throw new Error("usePetListMode must be used within PetListModeProvider.");

  return { ...context, isListEnabled: context.mode === "on" };
};
