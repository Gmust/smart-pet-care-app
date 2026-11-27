import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Chip } from "@/shadecn/ui/chip";
import { Tooltip } from "@/shadecn/ui/tooltip";

import type { PetFlag } from "../../types";

type FlagChipProps = {
  flag: PetFlag;
};

export function FlagChip({ flag }: FlagChipProps) {
  const { theme } = useUnistyles();

  const chip = <Chip variant="onPhoto" label={flag.label} />;

  if (!flag.details?.length) {
    return <View pointerEvents="none">{chip}</View>;
  }

  return (
    <Tooltip
      variant="white"
      trigger={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={flag.label}
          hitSlop={(theme.minTouchTarget - theme.iconSize.md) / 2}
        >
          {chip}
        </Pressable>
      }
    >
      {flag.details.join("\n")}
    </Tooltip>
  );
}
