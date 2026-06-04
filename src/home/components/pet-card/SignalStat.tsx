import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { hexToRGBA } from "@/common/utils/colors";
import { Text } from "@/shadecn/ui/text";

import type { Signal } from "../../types";

type SignalStatProps = {
  signal: Signal;
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
    borderLeftColor: hexToRGBA(theme.palette.brand.textOnDark, 0.12),
    paddingLeft: theme.spacing(3),
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
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
  value: {
    marginTop: theme.spacing(1),
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textOnDark,
  },
}));
