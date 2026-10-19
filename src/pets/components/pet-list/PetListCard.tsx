import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import type { PetResponseDto } from "@/api/generated";
import { ReminderType } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { TrendingUpIcon } from "@/icons/trending";
import { useGetRemindersByPet } from "@/reminders/queries/useGetReminderByPet";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { PetListCardReminderSkeleton } from "../../skeletons/PetListCardSkeleton";
import { PetSpeciesImage } from "../PetSpeciesImage";

import { StatCell } from "./StatCell";

type PetListCardProps = {
  pet: PetResponseDto;
  onPress: (petId: string) => void;
};

export function PetListCard({ pet, onPress }: PetListCardProps) {
  const { t } = useTranslation(["pets"]);
  const { theme } = useUnistyles();
  const router = useRouter();

  const [isPressed, setIsPressed] = useState(false);

  const { data: reminders, isLoading: isRemindersLoading } = useGetRemindersByPet(pet.id);

  const { vetVisitLabel, activityLabel } = useMemo(() => {
    type Reminder = NonNullable<typeof reminders>[number];
    const list = reminders ?? [];

    const latestLabel = (type: ReminderType, fallback: string) => {
      let latest: Reminder | undefined;
      let latestTime = -Infinity;
      for (const reminder of list) {
        if (reminder.type !== type) continue;
        const time = new Date(
          reminder.nextTriggerAt ?? reminder.startAt ?? reminder.createdAt ?? 0
        ).getTime();
        if (time > latestTime) {
          latest = reminder;
          latestTime = time;
        }
      }
      return latest?.nextTriggerAt
        ? new Date(latest.nextTriggerAt).toLocaleDateString([], { month: "short", day: "numeric" })
        : fallback;
    };

    return {
      vetVisitLabel: latestLabel(ReminderType.VetVisit, t("pets:petListCard.noVetVisit")),
      activityLabel: latestLabel(
        ReminderType.Activity,
        t("pets:petListCard.lastActivityPlaceholder")
      ),
    };
  }, [reminders, t]);

  return (
    <View style={[styles.card, isPressed && styles.cardPressed]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("pets:petListCard.accessibilityLabel", { name: pet.name })}
        onPress={() => onPress(pet.id ?? "")}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.overlay}
      />

      <View pointerEvents="none" style={styles.photoColumn}>
        <View style={styles.photoFrame}>
          <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} />
        </View>
      </View>

      <View pointerEvents="box-none" style={styles.content}>
        <View pointerEvents="none" style={styles.info}>
          <View style={styles.headerRow}>
            <Text
              variant="titleL"
              style={styles.name}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              ellipsizeMode="tail"
            >
              {pet.name}
            </Text>
            {/* TODO wire real status once backend health signal is ready */}
            <Chip
              label={t("pets:petListCard.statusStable")}
              tone="ok"
              variant="ghost"
              size="sm"
              icon={TrendingUpIcon}
            />
          </View>

          <View style={styles.metaRow}>
            {!!pet.breed && (
              <>
                <Text variant="bodyS" style={styles.meta}>
                  {pet.breed}
                </Text>
                <View style={styles.dot} />
              </>
            )}
            {!!pet.age && (
              <>
                <Text variant="bodyS" style={styles.meta}>
                  {pet.age}
                </Text>
                <View style={styles.dot} />
              </>
            )}
            <Text variant="bodyS" style={styles.meta}>
              {pet.sex}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatCell icon="weight" value={`${pet.weightKg ?? "—"} ${t("petListCard.kg")}`} />
            <StatCell icon="activity" value={activityLabel} />
            {isRemindersLoading ? (
              <PetListCardReminderSkeleton />
            ) : (
              <StatCell icon="vet" value={vetVisitLabel} />
            )}
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.actionBar}>
          <View pointerEvents="none" style={styles.viewInfo}>
            <Text variant="bodySemiBold" style={styles.ctaText}>
              {t("pets:petListCard.viewInfo")}
            </Text>
            <ChevronIcon
              direction="right"
              width={theme.iconSize.md}
              height={theme.iconSize.md}
              color={styles.ctaText.color}
            />
          </View>

          {!!pet.id && (
            <Button
              variant="text"
              size="inline"
              accessibilityLabel={t("pets:petListCard.assessmentAccessibilityLabel", {
                name: pet.name,
              })}
              onPress={() =>
                router.push({ pathname: "/(tabs)/pets/assessment", params: { petId: pet.id } })
              }
            >
              {t("pets:petListCard.assessment")}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    boxShadow: `0 3px 12px ${theme.palette.brand.primaryDark}12`,
  },
  cardPressed: {
    opacity: 0.75,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  photoColumn: {
    width: "38%",
    flexShrink: 0,
  },
  photoFrame: {
    flex: 1,
    minHeight: theme.spacing(34),
    overflow: "hidden",
    borderTopLeftRadius: theme.borderRadius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(2.5),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  name: {
    flex: 1,
    minWidth: 0,
    color: theme.palette.brand.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  meta: {
    color: theme.palette.brand.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing(1),
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.brand.primaryXsoft,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
  },
  viewInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: {
    color: theme.palette.brand.primaryDefault,
  },
}));
