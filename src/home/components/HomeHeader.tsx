import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { BellIcon } from "@/icons/bell";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { IconButton } from "./icon-button";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { getDaytime } from "@/common/utils/getDaytime";

type Props = {
  date: string;
  username: string;
  onNotificationsPress?: () => void;
};

export function HomeHeader({ date, username, onNotificationsPress }: Props) {
  const { t } = useTranslation(["home"]);
  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.message}>{t("greetings", { username, daytime: getDaytime() })}</Text>
      </View>
      <IconButton accessibilityLabel="Notifications" onPress={onNotificationsPress}>
        <BellIcon width={20} height={20} color={palette.brand.textPrimary} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  date: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  message: {
    marginTop: theme.spacing(1),
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    letterSpacing: 0,
    color: theme.palette.brand.textPrimary,
  },
}));
