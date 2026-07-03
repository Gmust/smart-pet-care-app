import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { useIsOnline } from "@/common/hooks/useIsOnline";
import { Text } from "@/shadecn/ui/text";

export function OfflineBanner() {
  const { t } = useTranslation(["common"]);
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const [dismissed, setDismissed] = useState(false);

  // Re-arm the banner for the next offline episode.
  useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <View style={[styles.wrapper, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("offline.dismiss")}
        style={styles.banner}
        onPress={() => setDismissed(true)}
      >
        <Text style={styles.text}>{t("offline.bannerMessage")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  banner: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.textBody,
  },
  text: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.white,
  },
}));
