import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type SectionHeaderProps = {
  label: string;
  compact?: boolean;
};

export function SectionHeader({ label, compact = false }: SectionHeaderProps) {
  return (
    <Text variant="label" style={[styles.sectionHeader, compact && styles.sectionHeaderCompact]}>
      {label}
    </Text>
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
}));
