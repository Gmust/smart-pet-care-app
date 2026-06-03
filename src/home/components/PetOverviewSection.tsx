import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { pets } from "../data";
import type { PetHealth } from "../types";
import { PetCarousel } from "./carousel/PetCarousel";

type PetOverviewSectionProps = {
  onStatusChange: (message: string) => void;
};

export function PetOverviewSection({ onStatusChange }: PetOverviewSectionProps) {
  const { t } = useTranslation(["home"]);
  const [homePets, setHomePets] = useState(pets);

  const handleAddPet = useCallback(() => {
    setHomePets((current) => {
      const nextIndex = current.length + 1;
      const nextPet: PetHealth = {
        id: `pet-${nextIndex}`,
        petName: `Scout ${nextIndex}`,
        score: 84,
        status: t("mockPets.newPetStatus"),
        trendLabel: t("mockPets.newPetTrend"),
        signals: {
          weight: { value: "5.0 kg", status: "ok" },
          appetite: { value: t("mockPets.signals.appetite"), status: "ok" },
          activity: { value: t("mockPets.signals.activity"), status: "ok" },
        },
      };

      onStatusChange(t("mockStatus.petAdded", { petName: nextPet.petName }));
      return [...current, nextPet];
    });
  }, [onStatusChange, t]);

  return <PetCarousel pets={homePets} onAddPet={handleAddPet} />;
}
