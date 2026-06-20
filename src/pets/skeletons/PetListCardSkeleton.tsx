import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

export function PetListCardReminderSkeleton() {
  return (
    <View style={styles.cell}>
      <SkeletonBox width={16} height={16} radius={8} />
      <SkeletonBox width={52} height={13} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(1),
    borderLeftWidth: 1,
    borderLeftColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(2),
  },
}));
