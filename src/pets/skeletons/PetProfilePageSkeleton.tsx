import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";
import { ListCard } from "@/shadecn/ui/card";

import { usePetHeroHeight } from "../hooks/usePetHeroHeight";

const BASICS_ROW_COUNT = 5;
const NOTE_ROW_COUNT = 2;
const TAB_COUNT = 4;

export function PetProfilePageSkeleton() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const heroHeight = usePetHeroHeight();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + theme.spacing(2) }]}>
        <View style={styles.topBarLeading}>
          <SkeletonBox style={styles.nameChip} />
        </View>
        <SkeletonBox style={styles.actionsButton} />
      </View>

      <View style={[styles.hero, { height: heroHeight }]}>
        <SkeletonBox height="100%" radius={0} />
      </View>

      <View style={styles.tabs}>
        {Array.from({ length: TAB_COUNT }, (_, tab) => (
          <View key={tab} style={styles.tab}>
            <SkeletonBox style={styles.tabLabel} />
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <SkeletonBox style={styles.sectionLabel} />
        <ListCard style={styles.basicsCard}>
          {Array.from({ length: BASICS_ROW_COUNT }, (_, row) => (
            <View key={row} style={styles.infoRow}>
              <SkeletonBox style={styles.infoLabel} />
              <SkeletonBox style={styles.infoValue} />
            </View>
          ))}
        </ListCard>

        <View style={styles.notesHeader}>
          <SkeletonBox style={styles.sectionLabel} />
          <SkeletonBox style={styles.addNote} />
        </View>
        <ListCard style={styles.shadow}>
          {Array.from({ length: NOTE_ROW_COUNT }, (_, row) => (
            <View key={row} style={styles.noteRow}>
              <SkeletonBox style={styles.noteIcon} />
              <View style={styles.noteTexts}>
                <SkeletonBox style={styles.noteTitle} />
                <SkeletonBox style={styles.notePreview} />
              </View>
            </View>
          ))}
        </ListCard>
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
  topBarLeading: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
  },
  nameChip: {
    width: theme.spacing(36),
    height: theme.textStyles.titleM.lineHeight + 2 * (theme.spacing(1) + theme.spacing(0.375)),
    borderRadius: theme.borderRadius.full,
  },
  actionsButton: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.full,
  },
  hero: {
    marginHorizontal: theme.spacing(4),
    marginBottom: theme.spacing(3),
    borderRadius: theme.borderRadius["2xl"],
    overflow: "hidden",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  tabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(5),
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2.5),
  },
  tabLabel: {
    width: theme.spacing(14),
    height: theme.textStyles.bodyS.lineHeight,
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
  },
  sectionLabel: {
    width: theme.spacing(16),
    height: theme.textStyles.label.lineHeight,
  },
  shadow: {
    boxShadow: theme.shadows.card,
  },
  basicsCard: {
    boxShadow: theme.shadows.card,
    marginBottom: theme.spacing(5),
  },
  infoRow: {
    minHeight: theme.spacing(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  infoLabel: {
    width: theme.spacing(20),
    height: theme.textStyles.body.lineHeight,
  },
  infoValue: {
    width: theme.spacing(24),
    height: theme.textStyles.body.lineHeight,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  addNote: {
    width: theme.spacing(16),
    height: theme.textStyles.bodySemiBold.lineHeight,
  },
  noteRow: {
    minHeight: theme.spacing(14.5),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  noteIcon: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.lg,
  },
  noteTexts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
  },
  noteTitle: {
    width: "42%",
    height: theme.textStyles.bodyS.lineHeight,
  },
  notePreview: {
    width: "78%",
    height: theme.textStyles.caption.lineHeight,
  },
}));
