import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { ReminderType } from "@/api/generated";
import { Chevron } from "@/icons/arrows";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import { useGetRemindersByPet } from "@/reminders/queries/useGetReminderByPet";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { PetListCardReminderSkeleton } from "../skeletons/PetListCardSkeleton";
import { PetSpeciesImage } from "./PetSpeciesImage";
import { StatCell } from "./StatCell";

type PetListCardProps = {
  pet: PetResponseDto;
  onPress: (petId: string) => void;
};

export function PetListCard({ pet, onPress }: PetListCardProps) {
  const { t } = useTranslation(["pets"]);
  // const StatusIcon = pet.statusTone === "ok" ? TrendingUpIcon : TriangleAlertIcon;
  // const statusStyle = pet.statusTone === "ok" ? styles.okChip : styles.warnChip;
  // const statusTextStyle = pet.statusTone === "ok" ? styles.okText : styles.warnText;

  const { data: reminders, isLoading: isRemindersLoading } = useGetRemindersByPet(pet.id);

  const StatusIcon = TriangleAlertIcon;
  const statusStyle = styles.warnChip;
  const statusTextStyle = styles.warnText;

  const petLastVetVisit = (reminders ?? [])
    .filter((reminder) => reminder.type === ReminderType.VetVisit)
    .sort(
      (a, b) =>
        new Date(b.nextTriggerAt ?? b.startAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.nextTriggerAt ?? a.startAt ?? a.createdAt ?? 0).getTime()
    )[0];

  const lastVetVisitLabel = petLastVetVisit?.nextTriggerAt
    ? new Date(petLastVetVisit.nextTriggerAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : t("pets:petListCard.noVetVisit");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("pets:petListCard.accessibilityLabel", { name: pet.name })}
      onPress={() => onPress(pet.id ?? "")}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.photoFrame}>
        <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} />
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {pet.name}
            </Text>
            <View style={[styles.statusChip, statusStyle]}>
              <StatusIcon width={14} height={14} color={statusTextStyle.color} />
              {/* TODO add status when backend would be ready */}
              <Text style={[styles.statusText, statusTextStyle]}>
                {t("pets:petListCard.statusOk")}
              </Text>
            </View>
          </View>

          <Text style={styles.meta} numberOfLines={1}>
            {pet.breed} • {pet.age} • {pet.sex}
          </Text>

          <View style={styles.statsRow}>
            <StatCell icon="weight" value={String(pet.weightKg)} first />
            {/* TODO When activity backend part would be done - add here last activity*/}
            <StatCell icon="activity" value={t("pets:petListCard.lastActivityPlaceholder")} />
            {isRemindersLoading ? (
              <PetListCardReminderSkeleton />
            ) : (
              <StatCell icon="vet" value={lastVetVisitLabel} />
            )}
          </View>
        </View>

        <View style={styles.actionBar}>
          <View style={styles.viewInfo}>
            <Text style={styles.actionText} numberOfLines={1}>
              {t("pets:petListCard.viewInfo")}
            </Text>
            <Chevron style={styles.arrow} color={palette.brand.primaryDefault} />
          </View>

          <Text style={styles.actionText} numberOfLines={1}>
            {t("pets:petListCard.assessment")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    height: theme.spacing(43),
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  photoFrame: {
    width: theme.spacing(29.5),
    height: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  content: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  info: {
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    lineHeight: theme.fontSize["2xl"] * 1.3,
    color: theme.palette.brand.textPrimary,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1.25),
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing(2.25),
    paddingVertical: theme.spacing(0.75),
  },
  okChip: {
    borderColor: theme.palette.brand.primaryDefault,
  },
  warnChip: {
    borderColor: theme.palette.brand.warn,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
  },
  okText: {
    color: theme.palette.brand.ok,
  },
  warnText: {
    color: theme.palette.brand.warn,
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    color: theme.palette.brand.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingTop: theme.spacing(1),
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  actionText: {
    flexShrink: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    color: theme.palette.brand.primaryDefault,
  },
  viewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  arrow: {
    transform: [{ rotate: "180deg" }],
  },
}));
