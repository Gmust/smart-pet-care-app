import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

import { SectionHeader } from "../components/SectionHeader";

export function PetProfilePageSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <SkeletonBox width={40} height={40} radius={20} />
        <View style={styles.topBarTitle}>
          <SkeletonBox width={140} height={22} />
        </View>
        <SkeletonBox width={40} height={40} radius={20} />
      </View>

      <View style={styles.hero}>
        <SkeletonBox height="100%" radius={0} />
      </View>

      <View style={styles.segmentedTabs}>
        {[0, 1, 2, 3].map((tab) => (
          <View key={tab} style={styles.segmentTab}>
            <SkeletonBox width={56} height={14} />
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <SectionHeader label="Basics" />
        <View style={styles.card}>
          {[0, 1, 2, 3, 4].map((row) => (
            <View key={row} style={styles.infoRow}>
              <SkeletonBox width={92} height={15} />
              <SkeletonBox width="42%" height={18} />
            </View>
          ))}
        </View>

        <View style={styles.notesHeader}>
          <SkeletonBox width={72} height={18} />
          <SkeletonBox width={62} height={18} />
        </View>
        <View style={styles.card}>
          {[0, 1].map((row) => (
            <View key={row} style={styles.noteRow}>
              <SkeletonBox width="42%" height={17} />
              <SkeletonBox width="78%" height={14} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  topBarTitle: {
    flex: 1,
    alignItems: "center",
  },
  hero: {
    height: theme.spacing(38.5),
    overflow: "hidden",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  segmentedTabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(5),
  },
  segmentTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2.5),
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    marginBottom: theme.spacing(5),
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
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  noteRow: {
    gap: theme.spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.brand.surfaceBorder,
    padding: theme.spacing(4),
  },
}));
