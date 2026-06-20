import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { getDaytime } from "@/common/utils/getDaytime";
import { BellIcon } from "@/icons/bell";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import dayjs from "dayjs";

type Props = {
  username: string;
};

export function HomeHeader({ username }: Props) {
  const { t } = useTranslation(["home"]);

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.date}>{dayjs().format("dddd · MMM D")}</Text>
        <Text style={styles.message}>{t("greetings", { username, daytime: getDaytime() })}</Text>
      </View>
      <Button
        accessibilityLabel="Notifications"
        variant="icon"
        size="icon"
        icon={<BellIcon width={20} height={20} color={palette.brand.textPrimary} />}
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    maxWidth: "90%",
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
