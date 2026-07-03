import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useIsOnline } from "@/common/hooks/useIsOnline";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { OfflineScreen } from "./OfflineScreen";
import type { ErrorBoundaryProps } from "expo-router";

// Shared fallback for Expo Router route ErrorBoundary exports. When the
// device is offline, the offline screen (with reconnect actions) is more
// actionable than a generic error message.
export function RouteErrorFallback({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation(["common"]);
  const isOnline = useIsOnline();

  useEffect(() => {
    console.error("Route render error:", error);
  }, [error]);

  if (!isOnline) {
    return <OfflineScreen onReconnected={retry} />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("errors.somethingWentWrong")}</Text>
      <Text style={styles.description}>{t("errors.screenErrorDescription")}</Text>
      <Button
        variant="primary"
        size="md"
        accessibilityLabel={t("errors.tryAgain")}
        style={styles.retryButton}
        onPress={retry}
      >
        {t("errors.tryAgain")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(6),
    backgroundColor: theme.palette.brand.surfacePage,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    color: theme.palette.brand.textBody,
    textAlign: "center",
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
}));
