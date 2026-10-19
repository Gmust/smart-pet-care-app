import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { DateTimeField } from "@/common/components/DateTimeField";

type DateTimeFieldRowProps = {
  value: string;
  onChange: (iso: string) => void;
  onBlur: () => void;
  error: boolean;
  datePlaceholder: string;
  timePlaceholder: string;
};

export const DateTimeFieldRow = ({
  value,
  onChange,
  onBlur,
  error,
  datePlaceholder,
  timePlaceholder,
}: DateTimeFieldRowProps) => {
  const current = value ? dayjs(value) : dayjs();

  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <DateTimeField
          mode="date"
          placeholder={datePlaceholder}
          value={value ? current.toDate() : null}
          display={(date) => dayjs(date).format("MMM D, YYYY")}
          maximumDate={new Date()}
          error={error}
          onChange={(date) =>
            onChange(
              current
                .year(dayjs(date).year())
                .month(dayjs(date).month())
                .date(dayjs(date).date())
                .toISOString()
            )
          }
          onBlur={onBlur}
        />
      </View>
      <View style={styles.item}>
        <DateTimeField
          mode="time"
          placeholder={timePlaceholder}
          value={value ? current.toDate() : null}
          display={(date) => dayjs(date).format("HH:mm")}
          error={error}
          onChange={(date) =>
            onChange(
              current
                .hour(dayjs(date).hour())
                .minute(dayjs(date).minute())
                .second(0)
                .millisecond(0)
                .toISOString()
            )
          }
          onBlur={onBlur}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.spacing(3),
  },
  item: {
    flex: 1,
    minWidth: 0,
  },
}));
