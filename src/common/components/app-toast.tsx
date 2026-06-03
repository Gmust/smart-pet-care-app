import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";

import "@/styles/config";

export type AppToastVariant = "success" | "error" | "warning" | "info";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const ICON: Record<AppToastVariant, IoniconName> = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "warning",
  info: "information-circle",
};

const ACCENT: Record<AppToastVariant, string> = {
  success: "#a3d9b8",
  error: "#ef4444",
  warning: "#fcd34d",
  info: "#7dd3fc",
};

function ThemedToast({
  variant,
  text1,
  text2,
}: { variant: AppToastVariant } & ToastConfigParams<unknown>) {
  const tone = ACCENT[variant];

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name={ICON[variant]} size={20} color={tone} />
      </View>
      <View style={styles.textWrap}>
        {!!text1 && (
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        )}
      </View>
    </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: theme.palette.brand.textOnDark,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.textSizing(1.25),
  },
  message: {
    color: theme.palette.brand.textOnDark,
    opacity: 0.72,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.textSizing(1.1),
  },
}));

export const toastConfig: ToastConfig = {
  success: (props) => <ThemedToast variant="success" {...props} />,
  error: (props) => <ThemedToast variant="error" {...props} />,
  warning: (props) => <ThemedToast variant="warning" {...props} />,
  info: (props) => <ThemedToast variant="info" {...props} />,
};
