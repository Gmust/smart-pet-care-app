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
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textSecondary,
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textPrimary,
  },
}));
