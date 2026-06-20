import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

export function PetListSubtitleSkeleton() {
  return <SkeletonBox width={132} height={20} />;
}

export function PetListCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width={118} height="100%" radius={0} style={styles.photo} />
      <View style={styles.content}>
        <View style={styles.header}>
          <SkeletonBox width="48%" height={22} />
          <SkeletonBox width={84} height={28} radius={14} />
        </View>
        <SkeletonBox width="70%" height={16} />
        <View style={styles.stats}>
          <SkeletonBox height={34} style={styles.stat} />
          <SkeletonBox height={34} style={styles.stat} />
          <SkeletonBox height={34} style={styles.stat} />
        </View>
        <SkeletonBox height={34} radius={0} style={styles.action} />
      </View>
    </View>
  );
}

export function PetListPageSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <PetListCardSkeleton key={item} />
      ))}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    height: theme.spacing(43),
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
  },
  photo: {
    borderTopLeftRadius: theme.borderRadius["2xl"],
    borderBottomLeftRadius: theme.borderRadius["2xl"],
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: theme.spacing(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  stats: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  stat: {
    flex: 1,
  },
  action: {
    marginHorizontal: -theme.spacing(4),
    marginBottom: -theme.spacing(4),
  },
}));
