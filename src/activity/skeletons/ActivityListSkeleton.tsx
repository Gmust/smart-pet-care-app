import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

const DAYS = [0, 1] as const;
const CARDS_PER_DAY = [0, 1, 2] as const;

export function ActivityListSkeleton() {
  return (
    <View style={styles.stack}>
      {DAYS.map((day) => (
        <View key={day} style={styles.section}>
          <SkeletonBox width={72} height={14} />
          <View style={styles.cards}>
            {CARDS_PER_DAY.map((card) => (
              <View key={card} style={styles.card}>
                <SkeletonBox width={40} height={40} radius={999} />
                <View style={styles.cardText}>
                  <SkeletonBox width="55%" height={16} />
                  <SkeletonBox width="35%" height={13} />
                </View>
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
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
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
    gap: theme.spacing(3),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius["2xl"],
    padding: theme.spacing(4),
  },
  cardText: {
    flex: 1,
    gap: theme.spacing(1.5),
  },
}));
