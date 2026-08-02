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
};

const STAT_ICON_SIZE = 16;

export function StatCell({ icon, value }: StatCellProps) {
  return (
    <View style={statCellStyles.statCell}>
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
      <Text
        variant="caption"
        style={statCellStyles.statValue}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}

export const statCellStyles = StyleSheet.create((theme) => ({
  statCell: {
    flex: 1,
    minWidth: 0,
    minHeight: theme.spacing(13),
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    borderRadius: theme.borderRadius.lg,
    borderCurve: "continuous",
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(1.5),
  },
  statValue: {
    textAlign: "center",
    color: theme.palette.brand.textPrimary,
  },
}));
