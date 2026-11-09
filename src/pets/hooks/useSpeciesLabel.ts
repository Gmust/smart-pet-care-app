import { useTranslation } from "react-i18next";

import { AnimalSpecies } from "@/api/generated";

/** Translated name for a backend species value; anything unrecognised is shown as-is. */
export const useSpeciesLabel = () => {
  const { t } = useTranslation("pets");

  return (species: string) => {
    const known = Object.values(AnimalSpecies).find((value) => value === species);
    return known ? t(`species.${known}`) : species;
  };
};
