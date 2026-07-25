import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { DateTimeField } from "@/common/components/DateTimeField";

import dayjs from "dayjs";

type Props = {
  from: string | null;
  to: string | null;
  onChangeFrom: (date: string) => void;
  onChangeTo: (date: string) => void;
};

export function DateRangeFilter({ from, to, onChangeFrom, onChangeTo }: Props) {
  const { t } = useTranslation(["health"]);

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <DateTimeField
          mode="date"
          label={t("health:recordList.filters.from")}
          placeholder={t("health:recordList.filters.fromPlaceholder")}
          value={from ? new Date(from) : null}
          display={(date) => dayjs(date).format("MMM D, YYYY")}
          maximumDate={to ? new Date(to) : new Date()}
          onChange={(date) => onChangeFrom(date.toISOString())}
        />
      </View>
      <View style={styles.field}>
        <DateTimeField
          mode="date"
          label={t("health:recordList.filters.to")}
          placeholder={t("health:recordList.filters.toPlaceholder")}
          value={to ? new Date(to) : null}
          display={(date) => dayjs(date).format("MMM D, YYYY")}
          minimumDate={from ? new Date(from) : undefined}
          maximumDate={new Date()}
          onChange={(date) => onChangeTo(date.toISOString())}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
}));
