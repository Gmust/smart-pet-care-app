import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import Toast, { type ToastConfig, type ToastConfigParams } from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { hexToRGBA } from "../utils/colors";

type AppToastVariant = "success" | "error" | "warning" | "info";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const ICON: Record<AppToastVariant, IoniconName> = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "warning",
  info: "information-circle",
};

function ThemedToast({
  variant,
  text1,
  text2,
}: { variant: AppToastVariant } & ToastConfigParams<unknown>) {
  const { theme } = useUnistyles();
  const tone = palette.toastAccent[variant];

  return (
    <Pressable accessibilityRole="button" onPress={() => Toast.hide()} style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name={ICON[variant]} size={theme.iconSize.xl} color={tone} />
      </View>
      <View style={styles.textWrap}>
        {!!text1 && (
          <Text variant="bodySemiBold" style={styles.title}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text variant="bodyS" style={styles.message}>
            {text2}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "96%",
    maxWidth: theme.spacing(105),
    minHeight: theme.spacing(14),
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.warn,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3.25),
    gap: theme.spacing(3),
  },
  badge: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.spacing(4.5),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRGBA(theme.palette.white, 0.1),
  },
  textWrap: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    color: theme.palette.brand.textOnDark,
    flexShrink: 1,
  },
  message: {
    color: theme.palette.brand.textOnDark,
    opacity: 0.72,
    flexShrink: 1,
  },
}));

export const toastConfig: ToastConfig = {
  success: (props) => <ThemedToast variant="success" {...props} />,
  error: (props) => <ThemedToast variant="error" {...props} />,
  warning: (props) => <ThemedToast variant="warning" {...props} />,
  info: (props) => <ThemedToast variant="info" {...props} />,
};
