import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import type { PetResponseDto } from "@/api";
import { hexToRGBA } from "@/common/utils/colors";
import { SquareActivityIcon } from "@/icons/activity";
import { HeartPulseIcon } from "@/icons/heart";
import { PawDecorationIcon } from "@/icons/paw-decoration";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";
import { isWellnessStateOk, WELLNESS_CARD_STATE_KEYS } from "@/wellness/constants";
import { useWellnessQuery } from "@/wellness/queries/useWellnessQuery";
import { parseWellnessScore } from "@/wellness/utils/parseWellnessScore";

import { SignalStat } from "./SignalStat";

type Props = {
  pet: PetResponseDto;
  backgroundColor?: string;
};

export function HealthPetCard({ pet, backgroundColor }: Props) {
  const { t } = useTranslation(["home", "wellness"]);

  const router = useRouter();

  const { name: petName, id: petId, photoUrl } = pet;

  const { data: wellness } = useWellnessQuery(petId);

  const score = parseWellnessScore(wellness?.wellnessScore);
  const scoreText = score ?? t("wellness:score.unavailable");
  const bandText = wellness?.band
    ? t(`wellness:band.${wellness.band}`)
    : t("wellness:band.unknown");

  const openWellness = () =>
    router.push(
      { pathname: "/(tabs)/pets/pet-profile", params: { petId, tab: "wellness", from: "home" } },
      { withAnchor: true }
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("healthPetCard.title", { petName })}
      // The card is one accessible element, so iOS VoiceOver cannot focus the
      // nested score button. Expose its score and its action on the card itself.
      accessibilityValue={{ text: `${t("wellness:score.label")}: ${scoreText}, ${bandText}` }}
      accessibilityActions={[{ name: "openWellness", label: t("wellness:score.label") }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "openWellness") openWellness();
      }}
      style={[styles.card, backgroundColor ? { backgroundColor } : null]}
      onPress={() =>
        router.push(
          { pathname: "/(tabs)/pets/pet-profile", params: { petId, from: "home" } },
          { withAnchor: true }
        )
      }
    >
      {photoUrl ? (
        <>
          <Image
            source={{ uri: photoUrl }}
            style={styles.backgroundImage}
            blurRadius={4}
            contentFit="cover"
          />
          <View style={styles.overlay} />
        </>
      ) : (
        <>
          <View style={[styles.paw, styles.pawTop]}>
            <PawDecorationIcon color={styles.pawColor.color} />
          </View>
          <View style={[styles.paw, styles.pawBottom]}>
            <PawDecorationIcon color={styles.pawColor.color} />
          </View>
        </>
      )}

      <View style={styles.top}>
        <View style={styles.headerRow}>
          <BlurView intensity={40} tint="dark" style={styles.iconPill}>
            <HeartPulseIcon width={16} height={16} color={palette.brand.textOnDark} />
          </BlurView>
          <BlurView intensity={40} tint="dark" style={styles.namePill}>
            <Text variant="labelCaps" style={styles.eyebrow}>
              {t("healthPetCard.title", { petName })}
            </Text>
          </BlurView>
          <View style={styles.trendChip}>
            <SquareActivityIcon width={13} height={13} color={palette.brand.primarySoft} />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("wellness:score.label")}
          style={styles.scoreBlock}
          onPress={openWellness}
        >
          <View style={styles.scoreValueRow}>
            <Text variant="display" style={styles.score}>
              {scoreText}
            </Text>
            {score !== null && (
              <Text variant="titleL" style={styles.scoreMax}>
                {t("wellness:score.outOf")}
              </Text>
            )}
          </View>
          <Text variant="bodyS" style={styles.status}>
            {bandText}
          </Text>
        </Pressable>
      </View>

      {!!wellness && (
        <View style={styles.signalRow}>
          {WELLNESS_CARD_STATE_KEYS.map((key) => (
            <SignalStat
              key={key}
              signal={{
                label: t(`wellness:states.labels.${key}`),
                value: t(`wellness:states.codes.${wellness.states[key]}`),
                status: isWellnessStateOk(wellness.states[key]) ? "ok" : "warn",
              }}
            />
          ))}
        </View>
      )}
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
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.45),
  },
  pawColor: {
    color: theme.palette.brand.primarySoft,
  },
  paw: {
    position: "absolute",
    marginLeft: -theme.spacing(8.75),
    opacity: 0.08,
    pointerEvents: "none",
  },
  pawTop: {
    left: "90%",
    top: theme.spacing(12.25),
    transform: [{ rotate: "20.71deg" }],
  },
  pawBottom: {
    left: "57.6%",
    top: theme.spacing(22.5),
    transform: [{ rotate: "-23.07deg" }],
  },
  top: {
    gap: theme.spacing(1),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  iconPill: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.55),
    padding: theme.spacing(1.5),
  },
  namePill: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.55),
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1),
  },
  eyebrow: {
    textTransform: "uppercase",
    color: theme.palette.brand.textOnDark,
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
  scoreBlock: {
    justifyContent: "center",
    // Nested tappable inside the card Pressable — keep it a real 44pt target.
    minHeight: 44,
    paddingHorizontal: theme.spacing(2.5),
  },
  scoreValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing(0.5),
  },
  score: {
    color: theme.palette.brand.textOnDark,
  },
  scoreMax: {
    marginBottom: theme.spacing(1),
    color: theme.palette.brand.textSecondary,
  },
  status: {
    marginTop: theme.spacing(1),
    color: theme.palette.brand.textFaint,
  },
  signalRow: {
    flexDirection: "row",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));
