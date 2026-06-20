import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { HeartPulseIcon } from "@/icons/heart";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { AiInsight } from "../types";
import dayjs from "dayjs";

type AiInsightCardProps = {
  insight: AiInsight;
  onAsk?: () => void;
  onDismiss?: () => void;
};

//TODO add real data
export function AiInsightCard({ onAsk, onDismiss }: AiInsightCardProps) {
  const { t } = useTranslation(["home"]);

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <HeartPulseIcon width={18} height={18} color={palette.brand.textOnDark} />
      </View>
      <View style={styles.body}>
        <View style={styles.insightContainer}>
          <Text style={styles.eyebrow}>{t("aiInsight.title")}</Text>
          <View style={styles.dot} />
          <Text style={styles.eyebrow}>{dayjs(new Date()).fromNow()}</Text>
        </View>
        <Text style={styles.text}>Test ai reposnse</Text>
        <View style={styles.actions}>
          <Chip
            label={t("aiInsight.askAssistantBtn")}
            tone="peach"
            variant="ghost"
            size="sm"
            onPress={onAsk}
          />
          <Chip
            label={t("aiInsight.dismissBtn")}
            tone="neutral"
            variant="ghost"
            size="sm"
            onPress={onDismiss}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  dot: {
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.borderRadius.full,
  },
  insightContainer: {
    flexDirection: "row",
    alignContent: "center",
    gap: theme.spacing(2),
  },
  card: {
    flexDirection: "row",
    gap: theme.spacing(3),
    backgroundColor: theme.palette.brand.peachSoft,
    borderRadius: theme.borderRadius["2xl"],
    borderWidth: 1,
    borderColor: theme.palette.brand.peachDefault,
    padding: theme.spacing(4),
  },
  icon: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.peachDefault,
  },
  body: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: theme.palette.brand.peachDefault,
    marginBottom: theme.spacing(1),
  },
  text: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.textSizing(1.25),
    color: theme.palette.brand.textPrimary,
    marginBottom: theme.spacing(2.5),
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing(1.5),
  },
}));
