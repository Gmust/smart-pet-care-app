import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { BackButton } from "@/common/components/BackButton";
import { Text } from "@/shadecn/ui/text";

type FeedingScreenHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export const FeedingScreenHeader = ({ title, subtitle, action }: FeedingScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.root}>
        <BackButton />
        <View style={styles.copy}>
          <Text variant="titleL" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text variant="bodyS" style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {action ?? <View style={styles.spacer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(1),
  },
  copy: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(1),
  },
  title: {
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
  spacer: {
    width: theme.spacing(9),
  },
}));
