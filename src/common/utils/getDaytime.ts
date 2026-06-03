import dayjs from "dayjs";
import i18next from "i18next";

export function getDaytime(): string {
  const hour = dayjs().hour();
  if (hour < 6) return i18next.t("daytimePeriods.night");
  if (hour < 12) return i18next.t("daytimePeriods.morning");
  if (hour < 18) return i18next.t("daytimePeriods.afternoon");
  if (hour < 22) return i18next.t("daytimePeriods.evening");
  return i18next.t("daytimePeriods.night");
}
