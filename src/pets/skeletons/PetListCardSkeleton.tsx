import { View } from "react-native";

import { SkeletonBox } from "@/common/components/Skeleton";

import { statCellStyles } from "../components/pet-list/StatCell";

export function PetListCardReminderSkeleton() {
  return (
    <View style={statCellStyles.statCell}>
      <SkeletonBox width={16} height={16} radius={8} />
      <SkeletonBox width={52} height={13} />
    </View>
  );
}
