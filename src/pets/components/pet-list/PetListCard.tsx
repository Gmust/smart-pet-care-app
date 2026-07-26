import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { ReminderType } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { TrendingUpIcon } from "@/icons/trending";
import { useGetRemindersByPet } from "@/reminders/queries/useGetReminderByPet";
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
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={t("pets:petListCard.accessibilityLabel", { name: pet.name })}
      onPress={() => onPress(pet.id ?? "")}
      style={styles.card}
    >
      <View style={styles.photoColumn}>
        <View style={styles.photoFrame}>
          <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text
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
                <Text style={styles.meta}>{pet.breed}</Text>
                <View style={styles.dot} />
              </>
            )}
            {!!pet.age && (
              <>
                <Text style={styles.meta}>{pet.age}</Text>
                <View style={styles.dot} />
              </>
            )}
            <Text style={styles.meta}>{pet.sex}</Text>
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

        <View style={styles.actionBar}>
          <View style={styles.actionItem}>
            <Text style={styles.actionText} numberOfLines={1}>
              {t("pets:petListCard.viewInfo")}
            </Text>
            <ChevronIcon direction="right" width={14} height={14} color={styles.actionText.color} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    ...theme.textStyles.titleL,
    color: theme.palette.brand.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  meta: {
    ...theme.textStyles.bodyS,
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
    gap: theme.spacing(8),
    backgroundColor: theme.palette.brand.primaryXsoft,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
  },
  actionText: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.primaryDefault,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
    borderRadius: theme.borderRadius.lg,
    borderCurve: "continuous",
  },
}));
