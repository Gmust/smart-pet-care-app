import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { Text } from "@/shadecn/ui/text";

type Props = {
  dayIso: string;
};

export const ActivityDayHeader = ({ dayIso }: Props) => {
  const { t } = useTranslation(["activity"]);

  const day = dayjs(dayIso);
  const today = dayjs().startOf("day");

  const label = day.isSame(today, "day")
    ? t("activity:list.today")
    : day.isSame(today.subtract(1, "day"), "day")
      ? t("activity:list.yesterday")
      : day.format("MMM D, YYYY");

  return (
    <Text variant="label" style={styles.label}>
      {label}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  label: {
    color: theme.palette.brand.textSecondary,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
  },
}));
