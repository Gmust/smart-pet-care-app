import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

export const TodayCardSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width="38%" height={theme.spacing(5)} />
        <SkeletonBox width="22%" height={theme.spacing(4)} />
      </View>
      <SkeletonBox height={theme.spacing(2.5)} radius={theme.borderRadius.full} />
      <View style={styles.row}>
        <SkeletonBox width="30%" height={theme.spacing(3.5)} />
        <SkeletonBox width="26%" height={theme.spacing(3.5)} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    boxShadow: theme.shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
}));
