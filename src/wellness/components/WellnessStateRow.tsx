import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type Props = {
  label: string;
  value: string;
  isOk: boolean;
};

export function WellnessStateRow({ label, value, isOk }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, isOk ? styles.dotOk : styles.dotWarn]} />
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
      <Text variant="bodySemiBold" style={isOk ? styles.valueOk : styles.valueWarn}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
  },
  dot: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.borderRadius.full,
  },
  dotOk: {
    backgroundColor: theme.palette.brand.ok,
  },
  dotWarn: {
    backgroundColor: theme.palette.brand.warn,
  },
  label: {
    flex: 1,
    color: theme.palette.brand.textPrimary,
  },
  valueOk: {
    color: theme.palette.brand.ok,
  },
  valueWarn: {
    color: theme.palette.brand.warn,
  },
}));
