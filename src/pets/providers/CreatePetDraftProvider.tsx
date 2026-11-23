import { createContext, useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import type { PetResponseDto } from "@/api/generated";
import { type CreatePetFormApi, useCreatePetForm } from "@/pets/hooks/useCreatePetForm";

type CreatePetDraftContextValue = {
  form: CreatePetFormApi;
  registerOnCreated: (listener: (pet: PetResponseDto) => void) => () => void;
};

export const CreatePetDraftContext = createContext<CreatePetDraftContextValue | null>(null);

export const CreatePetDraftProvider = ({ children }: { children: ReactNode }) => {
  const listenerRef = useRef<((pet: PetResponseDto) => void) | null>(null);

  const form = useCreatePetForm((pet) => listenerRef.current?.(pet));

  const registerOnCreated = useCallback((listener: (pet: PetResponseDto) => void) => {
    listenerRef.current = listener;
    return () => {
      if (listenerRef.current === listener) listenerRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ form, registerOnCreated }), [form, registerOnCreated]);

  return <CreatePetDraftContext.Provider value={value}>{children}</CreatePetDraftContext.Provider>;
};
