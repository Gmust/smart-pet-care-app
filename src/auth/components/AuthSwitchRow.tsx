import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

interface AuthSwitchRowProps {
  prompt: string;
  action: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "body" | "secondary";
}

export const AuthSwitchRow = ({
  prompt,
  action,
  onPress,
  disabled,
  tone = "secondary",
}: AuthSwitchRowProps) => {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.prompt(tone)}>
        {prompt}
      </Text>
      <Button variant="text" size="inline" disabled={disabled} onPress={onPress}>
        {action}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  prompt: (tone: "body" | "secondary") => ({
    color: tone === "body" ? theme.palette.brand.textBody : theme.palette.brand.textSecondary,
  }),
}));
