import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import { getDaytime } from "@/common/utils/getDaytime";
import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type Props = {
  username: string;
};

export function HomeHeader({ username }: Props) {
  const { t } = useTranslation(["home"]);

  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.greetings}>
        <Text style={styles.date}>{dayjs().format("dddd · MMM D")}</Text>
        <Text style={styles.message}>{t("greetings", { username, daytime: getDaytime() })}</Text>
      </View>
      <Button
        accessibilityLabel="ai-assistant"
        variant="icon"
        size="icon"
        icon={<AiIcon width={20} height={20} color={palette.brand.textPrimary} />}
        onPress={() => router.navigate("/assistant-pet-selection")}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    maxWidth: "100%",
  },
  date: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  greetings: {
    maxWidth: "90%",
  },
  message: {
    marginTop: theme.spacing(1),
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    letterSpacing: 0,
    color: theme.palette.brand.textPrimary,
  },
}));
