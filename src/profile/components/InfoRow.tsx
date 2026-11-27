import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type InfoRowProps = {
  label: string;
  value: string;
};

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text variant="body" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="body" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  infoRow: {
    minHeight: theme.spacing(10),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  infoLabel: {
    color: theme.palette.brand.textSecondary,
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    color: theme.palette.brand.textPrimary,
  },
}));
