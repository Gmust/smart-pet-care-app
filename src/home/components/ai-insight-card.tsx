import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { HeartPulseIcon } from "@/icons/heart";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { AiInsight } from "../types";

type AiInsightCardProps = {
  insight: AiInsight;
  onAsk?: () => void;
  onDismiss?: () => void;
};

export function AiInsightCard({ insight, onAsk, onDismiss }: AiInsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <HeartPulseIcon width={18} height={18} color={palette.brand.textOnDark} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>AI insight · {insight.timeAgo}</Text>
        <Text style={styles.text}>{insight.message}</Text>
        <View style={styles.actions}>
          <Chip label="Ask assistant" tone="peach" variant="ghost" size="sm" onPress={onAsk} />
          <Chip label="Dismiss" tone="neutral" variant="ghost" size="sm" onPress={onDismiss} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
