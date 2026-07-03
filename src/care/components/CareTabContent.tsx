//import { useTranslation } from "react-i18next";

import { EmptyTabPlaceholder } from "@/pets/components/tabs/EmptyTabPlaceholder";

type Props = {
  petId: string;
};

/**
 * Entry point for the Care tab. Section components (Meals, Food Tracker,
 * Vet Visit, Vaccination, Treatments, Weighing, Walking, Grooming) are wired
 * in incrementally — see docs/care-implementation-plan.md step 3/4.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CareTabContent({ petId }: Props) {
  // const { t } = useTranslation(["care"]);

  return <EmptyTabPlaceholder label="Care sections coming soon" />;
}
