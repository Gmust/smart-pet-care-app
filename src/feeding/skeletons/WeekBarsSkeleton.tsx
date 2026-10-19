import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

const BAR_HEIGHTS = [0.5, 0.8, 0.65, 1, 0.7, 0.9, 0.4];

export const WeekBarsSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((height) => (
          <View key={height} style={styles.barSlot}>
            <SkeletonBox height={`${height * 100}%`} radius={theme.borderRadius.sm} />
          </View>
        ))}
      </View>
      <SkeletonBox width="40%" height={theme.spacing(3.5)} />
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    boxShadow: theme.shadows.card,
  },
  bars: {
    height: theme.spacing(15.5),
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  barSlot: {
    flex: 1,
    justifyContent: "flex-end",
  },
}));
