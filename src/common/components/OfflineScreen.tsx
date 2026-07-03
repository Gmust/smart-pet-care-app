import { useTranslation } from "react-i18next";
import { Linking, Platform, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

interface OfflineScreenProps {
  onReconnected?: () => void;
}

export function OfflineScreen({ onReconnected }: OfflineScreenProps) {
  const { t } = useTranslation(["common"]);

  const handleReconnect = async () => {
    try {
      const state = await NetInfo.fetch();

      if (state.isConnected === null) return;

      onlineManager.setOnline(state.isConnected);
      if (!state.isConnected) return;
      onReconnected?.();
    } catch {
      // NetInfo probe failed; stay offline and let the user retry.
    }
  };

  const handleOpenWifiSettings = () => {
    if (Platform.OS === "android") {
      Linking.sendIntent("android.settings.WIFI_SETTINGS");
      return;
    }

    Linking.openSettings();
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("offline.title")}</Text>
      <Text style={styles.description}>{t("offline.description")}</Text>
      <View style={styles.actions}>
        <Button
          variant="primary"
          size="md"
          accessibilityLabel={t("offline.reconnect")}
          onPress={handleReconnect}
        >
          {t("offline.reconnect")}
        </Button>
        <Button
          variant="ghost"
          size="md"
          accessibilityLabel={t("offline.openWifiSettings")}
          onPress={handleOpenWifiSettings}
        >
          {t("offline.openWifiSettings")}
        </Button>
      </View>
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
  actions: {
    width: "100%",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));
