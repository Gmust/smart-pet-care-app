import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { ArrowRightIcon } from "@/icons/arrow-right";
import { Text } from "@/shadecn/ui/text";

type ProfileLinkRowProps = {
  label: string;
  onPress: () => void;
};

export const ProfileLinkRow = ({ label, onPress }: ProfileLinkRowProps) => {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      unstable_pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text variant="bodySemiBold" style={styles.label}>
        {label}
      </Text>
      <ArrowRightIcon
        width={theme.iconSize.lg}
        height={theme.iconSize.lg}
        color={theme.palette.brand.primaryDefault}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    minHeight: theme.minTouchTarget,
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(1),
  },
  rowPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  label: {
    flex: 1,
    color: theme.palette.brand.primaryDefault,
  },
}));
