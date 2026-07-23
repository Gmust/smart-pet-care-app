import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type InfoRowProps = {
  label: string;
  value: string;
};

export const InfoRow = ({ label, value }: InfoRowProps) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  infoRow: {
    minHeight: theme.spacing(10),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  infoLabel: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    ...theme.textStyles.body,
    color: theme.palette.brand.textPrimary,
  },
}));
