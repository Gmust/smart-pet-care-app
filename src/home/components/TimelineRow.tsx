import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import "@/styles/config";
import type { TimelineDot, TimelineEvent } from "../types";

const dotColors: Record<TimelineDot, string> = {
  ok: palette.brand.ok,
  warn: palette.brand.warn,
  primary: palette.brand.primaryDefault,
};

type TimelineRowProps = {
  event: TimelineEvent;
  last?: boolean;
};

export function TimelineRow({ event, last = false }: TimelineRowProps) {
  const { icon: IconComponent, title, meta, dot } = event;

  return (
    <View style={[styles.row, !last && styles.rowDivided]}>
      <View style={styles.dotWrap}>
        <View style={[styles.dot, { backgroundColor: dotColors[dot] }]} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <IconComponent width={14} height={14} color={palette.brand.textSecondary} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(3.5),
    padding: theme.spacing(3.5),
  },
  rowDivided: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.brand.surfaceBorder,
  },
  dotWrap: {
    width: theme.spacing(5),
    alignItems: "center",
    paddingTop: theme.spacing(1),
  },
  dot: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.borderRadius.full,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  meta: {
    marginTop: theme.spacing(0.5),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
}));
