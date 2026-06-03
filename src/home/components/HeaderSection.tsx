import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { greeting } from "../data";
import { HomeHeader } from "./HomeHeader";

type HeaderSectionProps = {
  activeReminderCount: number;
  onStatusChange: (message: string) => void;
};

export function HeaderSection({ activeReminderCount, onStatusChange }: HeaderSectionProps) {
  const { t } = useTranslation(["home"]);

  const handleNotificationsPress = useCallback(() => {
    onStatusChange(t("mockStatus.notifications", { count: activeReminderCount }));
  }, [activeReminderCount, onStatusChange, t]);

  return (
    <HomeHeader
      date={greeting.date}
      username={greeting.username}
      onNotificationsPress={handleNotificationsPress}
    />
  );
}
