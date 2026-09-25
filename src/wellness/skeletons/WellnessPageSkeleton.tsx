import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

const ROWS = [0, 1, 2, 3, 4, 5] as const;

export function WellnessPageSkeleton() {
  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <SkeletonBox width={96} height={38} />
        <SkeletonBox width={120} height={16} />
      </View>
      <View style={styles.card}>
        {ROWS.map((row) => (
          <SkeletonBox key={row} width="100%" height={18} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(5),
  },
  card: {
    gap: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3.5),
  },
}));
