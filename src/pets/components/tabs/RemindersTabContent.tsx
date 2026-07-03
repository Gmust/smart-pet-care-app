//import { useTranslation } from "react-i18next";

import { EmptyTabPlaceholder } from "./EmptyTabPlaceholder";

type Props = {
  petId: string;
};

/**
 * Placeholder — wiring the existing src/reminders list into this tab is out
 * of scope for the Care ticket. Swap this for the real reminders list once
 * that ticket lands.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RemindersTabContent({ petId }: Props) {
  //  const { t } = useTranslation(["pets"]);

  return <EmptyTabPlaceholder label="Coming soon" />;
}
