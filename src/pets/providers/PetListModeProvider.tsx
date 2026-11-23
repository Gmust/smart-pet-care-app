import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { PetListMode } from "../utils/petListModeStorage";
import { getPetListMode, setPetListMode } from "../utils/petListModeStorage";

type PetListModeContextValue = {
  mode: PetListMode | undefined;
  isLoaded: boolean;
  setMode: (mode: PetListMode) => void;
  isSuggestionDismissed: boolean;
  dismissSuggestion: () => void;
};

export const PetListModeContext = createContext<PetListModeContextValue | null>(null);

export const PetListModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<PetListMode | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState(false);
  const isChosenRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    getPetListMode().then((result) => {
      if (isCancelled) return;
      // A choice made before the read finished is newer than what was stored.
      if (!isChosenRef.current && result.ok && result.value) setModeState(result.value);
      setIsLoaded(true);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const setMode = useCallback((next: PetListMode) => {
    isChosenRef.current = true;
    setModeState(next);
    void setPetListMode(next);
  }, []);

  const dismissSuggestion = useCallback(() => setIsSuggestionDismissed(true), []);

  const value = useMemo(
    () => ({ mode, isLoaded, setMode, isSuggestionDismissed, dismissSuggestion }),
    [mode, isLoaded, setMode, isSuggestionDismissed, dismissSuggestion]
  );

  return <PetListModeContext.Provider value={value}>{children}</PetListModeContext.Provider>;
};
