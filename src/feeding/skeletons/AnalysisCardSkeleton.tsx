import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

export const AnalysisCardSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width="34%" height={theme.spacing(6)} radius={theme.borderRadius.full} />
        <SkeletonBox width={theme.spacing(5)} height={theme.spacing(5)} />
      </View>
      <View style={styles.texts}>
        <SkeletonBox width="60%" height={theme.spacing(5)} />
        <SkeletonBox width="45%" height={theme.spacing(3.5)} />
        <SkeletonBox width="30%" height={theme.spacing(3)} />
      </View>
      <SkeletonBox width="36%" height={theme.spacing(4)} />
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
  },
  texts: {
    gap: theme.spacing(1.5),
  },
}));
