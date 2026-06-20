import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ActivityIcon } from "@/icons/activity";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { WeightIcon } from "@/icons/weight";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type StatCellProps = {
  icon: "activity" | "vet" | "weight";
  value: string;
  first?: boolean;
};

const STAT_ICON_SIZE = 16;

export function StatCell({ icon, value, first = false }: StatCellProps) {
  return (
    <View style={[styles.statCell, !first && styles.statDivider]}>
      {icon === "weight" && (
        <WeightIcon
          width={STAT_ICON_SIZE}
          height={STAT_ICON_SIZE}
          color={palette.brand.textSecondary}
        />
      )}
      {icon === "activity" && (
        <ActivityIcon
          width={STAT_ICON_SIZE}
          height={STAT_ICON_SIZE}
          color={palette.brand.textSecondary}
        />
      )}
      {icon === "vet" && (
        <StethoscopeIcon
          width={STAT_ICON_SIZE}
          height={STAT_ICON_SIZE}
          color={palette.brand.textSecondary}
        />
      )}
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: theme.palette.brand.surfaceBorder,
  },
  statValue: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
