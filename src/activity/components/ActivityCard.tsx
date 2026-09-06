import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import type { ActivityLogResponseDto } from "@/api/generated";
import { Text } from "@/shadecn/ui/text";

import { ACTIVITY_TYPE_ICON } from "../constants";

type Props = {
  activity: ActivityLogResponseDto;
  onPress: (activity: ActivityLogResponseDto) => void;
};

/**
 * Summary only — type, time, and the headline metric. Everything else lives in
 * the details drawer, reached by tapping the card.
 */
export const ActivityCard = ({ activity, onPress }: Props) => {
  const { t } = useTranslation(["activity"]);
  const { theme } = useUnistyles();

  const TypeIcon = activity.type ? ACTIVITY_TYPE_ICON[activity.type] : null;
  const typeLabel = activity.type
    ? t(`activity:types.${activity.type}`)
    : t("activity:types.Other");

  // One headline metric: duration reads as the more natural summary of an
  // activity than a step count, so it wins when both are present.
  const headline =
    activity.durationMinutes != null
      ? t("activity:metrics.duration", { count: Number(activity.durationMinutes) })
      : activity.steps != null
        ? t("activity:metrics.steps", { count: Number(activity.steps) })
        : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("activity:list.openActions", { type: typeLabel })}
      onPress={() => onPress(activity)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        {!!TypeIcon && (
          <TypeIcon
            width={theme.iconSize.xl}
            height={theme.iconSize.xl}
            color={styles.iconColor.color}
          />
        )}
      </View>

      <View style={styles.body}>
        <Text variant="bodySemiBold" style={styles.title} numberOfLines={1}>
          {typeLabel}
        </Text>
        {!!headline && (
          <Text variant="bodyS" style={styles.headline}>
            {headline}
          </Text>
        )}
      </View>

      {!!activity.recordedAt && (
        <Text variant="caption" style={styles.time}>
          {dayjs(activity.recordedAt).format("HH:mm")}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius["2xl"],
    padding: theme.spacing(4),
  },
  pressed: {
    opacity: 0.75,
  },
  iconCircle: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primarySoft,
  },
  iconColor: {
    color: theme.palette.brand.primaryDark,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.5),
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  headline: {
    color: theme.palette.brand.textSecondary,
  },
  time: {
    color: theme.palette.brand.textSecondary,
  },
}));
