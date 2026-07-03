//import { useTranslation } from "react-i18next";

import { EmptyTabPlaceholder } from "./EmptyTabPlaceholder";

type Props = {
  petId: string;
};

/** Placeholder — Health tab is out of scope for the Care ticket. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HealthTabContent({ petId }: Props) {
  //  const { t } = useTranslation(["pets"]);

  return <EmptyTabPlaceholder label="Coming soon" />;
}
