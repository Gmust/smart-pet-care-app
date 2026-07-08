import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SkeletonBox } from "@/common/components/Skeleton";

type CareRuleRowSkeletonSize = "lg" | "sm";

type RowProps = {
  size?: CareRuleRowSkeletonSize;
};

export function CareRuleRowSkeleton({ size = "sm" }: RowProps) {
  rowVariants.useVariants({ size });
  const isLg = size === "lg";

  return (
    <View style={rowVariants.row}>
      <SkeletonBox width={isLg ? 44 : 36} height={isLg ? 44 : 36} radius={8} />
      <View style={rowVariants.textCol}>
        <SkeletonBox width={isLg ? 140 : 120} height={isLg ? 16 : 14} />
        <SkeletonBox width={isLg ? 70 : 60} height={isLg ? 13 : 11} />
      </View>
      <SkeletonBox width={56} height={20} radius={11} />
    </View>
  );
}

type ListProps = {
  rows?: number;
  size?: CareRuleRowSkeletonSize;
};

export function CareListSkeleton({ rows = 2, size = "sm" }: ListProps) {
  return (
    <View style={styles.stack}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.rowWrapper}>
          <CareRuleRowSkeleton size={size} />
        </View>
      ))}
    </View>
  );
}

const rowVariants = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    variants: {
      size: {
        lg: { gap: theme.spacing(3.5) },
        sm: { gap: theme.spacing(3) },
      },
    },
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.5),
  },
}));

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(2),
  },
  rowWrapper: {
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3),
  },
}));
