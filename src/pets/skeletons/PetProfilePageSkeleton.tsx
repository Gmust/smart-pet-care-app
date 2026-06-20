import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

import { SectionHeader } from "../components/SectionHeader";

export function PetProfileHeroSkeleton() {
  return <SkeletonBox height="100%" radius={0} />;
}

export function PetProfilePageSkeleton() {
  return (
    <>
      <SectionHeader label="Basics" />
      <View style={styles.card}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.infoRow}>
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
        {[0, 1].map((item) => (
          <View key={item} style={styles.noteRow}>
            <SkeletonBox width="42%" height={17} />
            <SkeletonBox width="78%" height={14} />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
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
