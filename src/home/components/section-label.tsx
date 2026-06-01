import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type SectionLabelProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export function SectionLabel({ title, action, onActionPress }: SectionLabelProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {!!action && (
        <Pressable accessibilityRole="button" onPress={onActionPress}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(1),
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textPrimary,
  },
  action: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.primaryDefault,
  },
}));
