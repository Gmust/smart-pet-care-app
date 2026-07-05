import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

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

const styles = StyleSheet.create((theme) => ({
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
