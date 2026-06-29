import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

export function ProfileHeroSkeleton() {
  return (
    <View style={styles.hero}>
      <SkeletonBox width={80} height={80} radius={9999} />
      <View style={styles.heroCopy}>
        <SkeletonBox width="55%" height={24} />
        <SkeletonBox width="70%" height={16} />
      </View>
    </View>
  );
}

export function ProfilePageSkeleton() {
  return (
    <View style={styles.card}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={styles.infoRow}>
          <SkeletonBox width={96} height={15} />
          <SkeletonBox width="40%" height={18} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    alignItems: "center",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(4),
  },
  heroCopy: {
    alignItems: "center",
    gap: theme.spacing(2),
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3.5),
  },
}));
