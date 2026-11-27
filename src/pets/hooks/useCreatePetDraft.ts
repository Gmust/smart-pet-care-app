import { useContext } from "react";

import { CreatePetDraftContext } from "@/pets/providers/CreatePetDraftProvider";

export const useCreatePetDraft = () => {
  const context = useContext(CreatePetDraftContext);
  if (!context) {
    throw new Error("useCreatePetDraft must be used within CreatePetDraftProvider");
  }
  return context;
};
