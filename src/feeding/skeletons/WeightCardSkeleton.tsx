import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

export const WeightCardSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width="24%" height={theme.spacing(5)} />
        <SkeletonBox width="36%" height={theme.spacing(6)} radius={theme.borderRadius.full} />
      </View>
      <SkeletonBox height={theme.spacing(14)} />
      <View style={styles.footer}>
        <SkeletonBox width="22%" height={theme.spacing(4)} />
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
    gap: theme.spacing(2),
  },
  footer: {
    alignItems: "flex-end",
  },
}));
