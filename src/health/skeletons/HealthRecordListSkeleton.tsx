import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

const GROUPS = [0, 1] as const;
const CARDS_PER_GROUP = [0, 1, 2] as const;

export function HealthRecordListSkeleton() {
  return (
    <View style={styles.stack}>
      {GROUPS.map((group) => (
        <View key={group} style={styles.section}>
          <SkeletonBox width={64} height={14} />
          <View style={styles.cards}>
            {CARDS_PER_GROUP.map((card) => (
              <View key={card} style={styles.card}>
                <SkeletonBox width={36} height={36} radius={8} />
                <View style={styles.cardText}>
                  <SkeletonBox width="70%" height={16} />
                </View>
                <SkeletonBox width={64} height={13} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(5),
  },
  section: {
    gap: theme.spacing(2),
  },
  cards: {
    gap: theme.spacing(2),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
}));
