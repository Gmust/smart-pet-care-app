import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { hexToRGBA } from "@/common/utils/colors";
import { SquareActivityIcon } from "@/icons/activity";
import { HeartPulseIcon } from "@/icons/heart";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { PetHealth } from "../../types";
import { SignalStat } from "./SignalStat";
import { useRouter } from "expo-router";

type Props = {
  pet: PetHealth;
  backgroundColor?: string;
};

export function HealthPetCard({ pet, backgroundColor }: Props) {
  const { t } = useTranslation(["home"]);

  const router = useRouter();

  const { id, petName, score, status, trendLabel, signals } = pet;

  const handleOpenPet = (petId: string) => {
    router.push({ pathname: "/(tabs)/pet-profile", params: { petId } });
  };

  const signalItems = [
    { key: "weight", label: t("healthPetCard.signals.weight"), ...signals.weight },
    { key: "appetite", label: t("healthPetCard.signals.appetite"), ...signals.appetite },
    { key: "activity", label: t("healthPetCard.signals.activity"), ...signals.activity },
  ];

  return (
    <Pressable
      style={[styles.card, backgroundColor ? { backgroundColor } : null]}
      onPress={() => handleOpenPet(id)}
    >
      <View style={styles.top}>
        <View style={styles.headerRow}>
          <HeartPulseIcon width={16} height={16} color={palette.brand.textSecondary} />
          <Text style={styles.eyebrow}>{t("healthPetCard.title", { petName })}</Text>
          <View style={styles.trendChip}>
            <SquareActivityIcon width={13} height={13} color={palette.brand.primarySoft} />
            <Text style={styles.trendLabel}>{trendLabel}</Text>
          </View>
        </View>

        <View style={styles.scoreBlock}>
          <View style={styles.scoreValueRow}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.status}>{status}</Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: theme.palette.brand.primaryDark,
    borderRadius: theme.borderRadius["2xl"],
    paddingHorizontal: theme.spacing(5),
    paddingVertical: theme.spacing(4),
    overflow: "hidden",
  },
  top: {
    gap: theme.spacing(1),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  eyebrow: {
    flex: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
  trendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.25),
    backgroundColor: hexToRGBA(theme.palette.brand.primarySoft, 0.14),
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing(2.75),
    paddingVertical: theme.spacing(1.25),
  },
  trendLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textOnDark,
  },
  scoreBlock: {
    paddingHorizontal: theme.spacing(2.5),
  },
  scoreValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing(0.5),
  },
  score: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["3xl"],
    letterSpacing: -0.8,
    color: theme.palette.brand.textOnDark,
  },
  scoreMax: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    marginBottom: theme.spacing(1),
    letterSpacing: -0.5,
    color: theme.palette.brand.textSecondary,
  },
  status: {
    marginTop: theme.spacing(1),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textFaint,
  },
  signalRow: {
    flexDirection: "row",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(3.5),
    borderTopWidth: 1,
    borderTopColor: hexToRGBA(theme.palette.brand.textOnDark, 0.12),
  },
}));
