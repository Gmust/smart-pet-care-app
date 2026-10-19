import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { Card } from "@/shadecn/ui/card";

const ROWS = [0, 1];

export const MealsListSkeleton = () => {
  const { theme } = useUnistyles();

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <SkeletonBox
            width={theme.spacing(9)}
            height={theme.spacing(9)}
            radius={theme.borderRadius.lg}
          />
          <View style={styles.texts}>
            <SkeletonBox width="55%" height={theme.spacing(4)} />
            <SkeletonBox width="35%" height={theme.spacing(3)} />
          </View>
          <SkeletonBox width={theme.spacing(10)} height={theme.spacing(3.5)} />
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    boxShadow: theme.shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    padding: theme.spacing(3),
  },
  texts: {
    flex: 1,
    gap: theme.spacing(1.5),
  },
}));
