import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Switch } from "@/shadecn/ui/switch";
import { Text } from "@/shadecn/ui/text";

type SettingRowProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const SettingRow = ({
  icon,
  title,
  subtitle,
  checked,
  onCheckedChange,
}: SettingRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.copy}>
        <Text variant="bodyS" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        accessibilityLabel={title}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  iconWrap: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
}));
