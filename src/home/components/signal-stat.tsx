import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { Signal } from "../types";

type SignalStatProps = {
  signal: Signal;
  /** First column omits the left divider. */
  first?: boolean;
};

export function SignalStat({ signal, first = false }: SignalStatProps) {
  return (
    <View style={[styles.col, !first && styles.colDivided]}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, signal.status === "ok" ? styles.dotOk : styles.dotWarn]} />
        <Text style={styles.label}>{signal.label}</Text>
      </View>
      <Text style={styles.value}>{signal.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  col: {
    flex: 1,
  },
  colDivided: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.14)",
    paddingLeft: theme.spacing(3.5),
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
    backgroundColor: "#f5c98a",
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textOnDark,
    opacity: 0.7,
  },
  value: {
    marginTop: theme.spacing(0.75),
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.white,
  },
}));
