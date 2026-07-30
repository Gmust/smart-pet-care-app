import { usePetsQuery } from "@/pets/queries/usePetsQuery";

import { PetOverviewSectionSkeleton } from "../skeletons/HomePageSkeleton";

import { PetCarousel } from "./carousel/PetCarousel";

export function PetOverviewSection() {
  const { data: pets, isLoading } = usePetsQuery();

  if (isLoading) {
    return <PetOverviewSectionSkeleton />;
  }

  return <PetCarousel pets={pets ?? []} />;
}
