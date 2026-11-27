import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { hexToRGBA } from "@/common/utils/colors";
import { Text } from "@/shadecn/ui/text";

import type { Signal } from "../../types";

type SignalStatProps = {
  signal: Signal;
};

export function SignalStat({ signal }: SignalStatProps) {
  return (
    <View style={styles.col}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, signal.status === "ok" ? styles.dotOk : styles.dotWarn]} />
        <Text variant="caption" style={styles.label}>
          {signal.label}
        </Text>
      </View>
      <Text variant="label" style={styles.value}>
        {signal.value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  col: {
    flex: 1,
    minWidth: 0,
    borderRadius: theme.borderRadius.lg,
    borderCurve: "continuous",
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.55),
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(2),
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  dot: {
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.borderRadius.full,
  },
  dotOk: {
    backgroundColor: theme.palette.brand.primarySoft,
  },
  dotWarn: {
    backgroundColor: theme.palette.brand.warnSoft,
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
  value: {
    marginTop: theme.spacing(1),
    color: theme.palette.brand.textOnDark,
  },
}));
