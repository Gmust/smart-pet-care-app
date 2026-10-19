import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

type SectionHeaderProps = {
  label: string;
  compact?: boolean;
  action?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  label,
  compact = false,
  action,
  onActionPress,
}: SectionHeaderProps) {
  const text = (
    <Text variant="label" style={[styles.sectionHeader, compact && styles.sectionHeaderCompact]}>
      {label}
    </Text>
  );

  if (!action) return text;

  return (
    <View style={styles.row}>
      {text}
      <Button variant="text" size="inline" onPress={onActionPress}>
        {action}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
  sectionHeaderCompact: {
    flex: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
}));
