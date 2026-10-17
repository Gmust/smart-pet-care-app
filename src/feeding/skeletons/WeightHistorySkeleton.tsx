import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card, ListCard } from "@/shadecn/ui/card";

const ROWS = [0, 1, 2];

export const WeightHistorySkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <>
      <Card radius="loose" padding="none" style={styles.chart}>
        <View style={styles.row}>
          <SkeletonBox width="24%" height={theme.spacing(5)} />
          <SkeletonBox width="36%" height={theme.spacing(6)} radius={theme.borderRadius.full} />
        </View>
        <SkeletonBox height={theme.spacing(40)} />
      </Card>

      <ListCard style={styles.list}>
        {ROWS.map((row) => (
          <View key={row} style={styles.entryRow}>
            <SkeletonBox width="35%" height={theme.spacing(4)} />
            <SkeletonBox width={theme.spacing(14)} height={theme.spacing(4)} />
          </View>
        ))}
      </ListCard>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  chart: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    boxShadow: theme.shadows.card,
  },
  list: {
    boxShadow: theme.shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
    minHeight: theme.minTouchTarget,
  },
}));
