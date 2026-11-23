import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type SectionHeaderProps = {
  label: string;
};

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <Text variant="label" style={styles.sectionHeader}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
}));
