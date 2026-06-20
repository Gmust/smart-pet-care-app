import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

export function HeaderSectionSkeleton() {
  return (
    <View style={styles.headerRoot}>
      <View style={styles.headerCopy}>
        <SkeletonBox width={118} height={16} />
        <SkeletonBox width={220} height={34} radius={12} />
      </View>
      <SkeletonBox width={44} height={44} radius={22} />
    </View>
  );
}

export function PetOverviewSectionSkeleton() {
  return (
    <View style={styles.petOverviewRoot}>
      <View style={styles.petOverviewCard}>
        <View style={styles.petOverviewHeaderRow}>
          <SkeletonBox width={150} height={14} />
          <SkeletonBox width={74} height={26} radius={13} />
        </View>
        <View style={styles.petOverviewScoreBlock}>
          <SkeletonBox width={96} height={44} radius={12} />
          <SkeletonBox width="72%" height={16} />
        </View>
        <View style={styles.petOverviewSignalRow}>
          <SkeletonBox height={42} style={styles.petOverviewSignal} />
          <SkeletonBox height={42} style={styles.petOverviewSignal} />
          <SkeletonBox height={42} style={styles.petOverviewSignal} />
        </View>
      </View>
      <View style={styles.dots}>
        <SkeletonBox width={8} height={8} radius={4} />
        <SkeletonBox width={8} height={8} radius={4} />
      </View>
    </View>
  );
}

export function InsightSectionSkeleton() {
  return (
    <View style={styles.insightCard}>
      <SkeletonBox width={36} height={36} radius={8} />
      <View style={styles.insightBody}>
        <SkeletonBox width={152} height={14} />
        <SkeletonBox height={16} />
        <SkeletonBox width="82%" height={16} />
        <View style={styles.insightActions}>
          <SkeletonBox width={116} height={30} radius={15} />
          <SkeletonBox width={78} height={30} radius={15} />
        </View>
      </View>
    </View>
  );
}

export function RemindersSectionSkeleton() {
  return (
    <View style={styles.reminderGroup}>
      <SkeletonBox width={84} height={14} />
      <View style={styles.reminderStack}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.reminderCard}>
            <SkeletonBox width={36} height={36} radius={8} />
            <View style={styles.reminderText}>
              <SkeletonBox width="76%" height={16} />
              <SkeletonBox width="48%" height={13} />
            </View>
            <SkeletonBox width={72} height={28} radius={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <HeaderSectionSkeleton />
      <PetOverviewSectionSkeleton />
      <InsightSectionSkeleton />
      <RemindersSectionSkeleton />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  headerRoot: {
    maxWidth: "90%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(4),
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing(2),
  },
  petOverviewRoot: {
    gap: theme.spacing(3),
    marginHorizontal: -theme.spacing(5),
    paddingHorizontal: theme.spacing(5),
  },
  petOverviewCard: {
    height: 196,
    justifyContent: "space-between",
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(5),
    paddingVertical: theme.spacing(4),
  },
  petOverviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  petOverviewScoreBlock: {
    gap: theme.spacing(2),
  },
  petOverviewSignalRow: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  petOverviewSignal: {
    flex: 1,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing(2),
  },
  insightCard: {
    flexDirection: "row",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(4),
  },
  insightBody: {
    flex: 1,
    gap: theme.spacing(2),
  },
  insightActions: {
    flexDirection: "row",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
  },
  reminderGroup: {
    gap: theme.spacing(2),
  },
  reminderStack: {
    gap: theme.spacing(2),
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3),
  },
  reminderText: {
    flex: 1,
    gap: theme.spacing(1.5),
  },
}));
