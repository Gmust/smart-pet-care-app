import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { SquareActivityIcon } from "@/icons/activity";
import { HeartPulseIcon } from "@/icons/heart";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { SignalStat } from "./signal-stat";

const heroGradientColors = [palette.brand.primaryDefault, palette.brand.primaryDark] as const;

type SignalStatus = "ok" | "warn";

type HealthSignal = { value: string; status: SignalStatus };

type Props = {
  petName: string;
  score: number;
  status: string;
  trendLabel: string;
  signals: {
    weight: HealthSignal;
    appetite: HealthSignal;
    activity: HealthSignal;
  };
};

export function HealthPetCard({ petName, score, status, trendLabel, signals }: Props) {
  const { t } = useTranslation(["home"]);

  const signalItems = [
    { key: "weight", label: t("healthPetCard.signals.weight"), ...signals.weight },
    { key: "appetite", label: t("healthPetCard.signals.appetite"), ...signals.appetite },
    { key: "activity", label: t("healthPetCard.signals.activity"), ...signals.activity },
  ];

  return (
    <LinearGradient
      colors={heroGradientColors}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.eyebrowRow}>
        <HeartPulseIcon width={13} height={13} color={palette.brand.textOnDark} />
        <Text style={styles.eyebrow}>{t("healthPetCard.title", { petName })}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreBlock}>
          <View style={styles.scoreValueRow}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.status}>{status}</Text>
        </View>
        <View style={styles.badge}>
          <SquareActivityIcon width={13} height={13} color={palette.brand.textOnDark} />
          <Text style={styles.badgeLabel}>{trendLabel}</Text>
        </View>
      </View>

      <View style={styles.signalRow}>
        {signalItems.map((signal, index) => (
          <SignalStat
            key={signal.key}
            signal={{ label: signal.label, value: signal.value, status: signal.status }}
            first={index === 0}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.borderRadius["3xl"],
    padding: theme.spacing(5),
    overflow: "hidden",
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  eyebrow: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: theme.palette.brand.textOnDark,
    opacity: 0.8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  scoreBlock: {
    flex: 1,
  },
  scoreValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  score: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["4xl"],
    letterSpacing: 0,
    color: theme.palette.white,
  },
  scoreMax: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(0.5),
    color: theme.palette.white,
    opacity: 0.6,
  },
  status: {
    marginTop: theme.spacing(1.5),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textOnDark,
    opacity: 0.85,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.25),
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1.5),
  },
  badgeLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textOnDark,
  },
  signalRow: {
    flexDirection: "row",
    marginTop: theme.spacing(4.5),
    paddingTop: theme.spacing(3.5),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
}));
