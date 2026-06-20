import { useMemo } from "react";

import { usePetsQuery } from "@/pets/queries/usePetsQuery";

import { PetOverviewSectionSkeleton } from "../skeletons/HomePageSkeleton";
import { toPetHealth } from "../utils/homeMappers";
import { PetCarousel } from "./carousel/PetCarousel";

export function PetOverviewSection() {
  const petsQuery = usePetsQuery();
  const pets = useMemo(() => (petsQuery.data ?? []).map(toPetHealth), [petsQuery.data]);

  if (petsQuery.isLoading) {
    return <PetOverviewSectionSkeleton />;
  }

  return <PetCarousel pets={pets} />;
}
