import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  /** Shown in a round badge above the title. */
  icon?: ReactNode;
}

export const AuthHeader = ({ title, subtitle, icon }: AuthHeaderProps) => {
  return (
    <View style={styles.header}>
      {!!icon && <View style={styles.badge}>{icon}</View>}
      <Text variant="display" style={styles.title}>
        {title}
      </Text>
      {!!subtitle && (
        <Text variant="body" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(2),
  },
  badge: {
    width: theme.spacing(18),
    height: theme.spacing(18),
    marginBottom: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primarySoft,
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
}));
