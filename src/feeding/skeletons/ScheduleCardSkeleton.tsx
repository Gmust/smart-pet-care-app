import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

export const ScheduleCardSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <SkeletonBox
        width={theme.spacing(10)}
        height={theme.spacing(10)}
        radius={theme.borderRadius.lg}
      />
      <View style={styles.texts}>
        <SkeletonBox width="50%" height={theme.spacing(4)} />
        <SkeletonBox width="35%" height={theme.spacing(3)} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    padding: theme.spacing(4),
    boxShadow: theme.shadows.card,
  },
  texts: {
    flex: 1,
    gap: theme.spacing(1.5),
  },
}));
