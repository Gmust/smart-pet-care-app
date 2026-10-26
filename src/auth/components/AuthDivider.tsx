import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

export const AuthDivider = () => {
  const { t } = useTranslation(["auth"]);

  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text variant="caption" style={styles.text}>
        {t("auth:screen.orDivider")}
      </Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  line: {
    flex: 1,
    height: theme.spacing(0.25),
    backgroundColor: theme.palette.brand.surfaceBorder,
  },
  text: {
    color: theme.palette.brand.textFaint,
  },
}));
