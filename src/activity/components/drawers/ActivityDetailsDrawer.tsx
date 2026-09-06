import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import type { ActivityLogResponseDto } from "@/api/generated";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { ActivityMap } from "../../components/ActivityMap";
import { decodeActivityLocation } from "../../utils/activityLocation";

type Props = {
  activity: ActivityLogResponseDto | null;
  onClose: () => void;
};

export const ActivityDetailsDrawer = ({ activity, onClose }: Props) => {
  const { t } = useTranslation(["activity"]);

  if (!activity) return null;

  const typeLabel = activity.type
    ? t(`activity:types.${activity.type}`)
    : t("activity:types.Other");
  const location = decodeActivityLocation(activity.location);

  // Only rows the entry actually has — a null metric means "not measured",
  // which an empty row or a zero would misrepresent.
  const rows: { label: string; value: string }[] = [
    activity.recordedAt
      ? {
          label: t("activity:details.recordedAt"),
          value: dayjs(activity.recordedAt).format("MMM D, YYYY HH:mm"),
        }
      : null,
    activity.intensity
      ? {
          label: t("activity:details.intensity"),
          value: t(`activity:intensities.${activity.intensity}`),
        }
      : null,
    activity.durationMinutes != null
      ? {
          label: t("activity:details.duration"),
          value: t("activity:metrics.duration", { count: Number(activity.durationMinutes) }),
        }
      : null,
    activity.steps != null
      ? {
          label: t("activity:details.steps"),
          value: t("activity:metrics.steps", { count: Number(activity.steps) }),
        }
      : null,
    activity.activeMinutes != null
      ? {
          label: t("activity:details.activeMinutes"),
          value: t("activity:metrics.activeMinutes", { count: Number(activity.activeMinutes) }),
        }
      : null,
    location?.label ? { label: t("activity:details.location"), value: location.label } : null,
    activity.source ? { label: t("activity:details.source"), value: activity.source } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent scrollable snapPoints={["75%"]} enableDynamicSizing={false}>
        <DrawerCloseButton />

        <DrawerHeader>
          <DrawerTitle>{typeLabel}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView contentContainerStyle={styles.content}>
          <View style={styles.rows}>
            {rows.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text variant="bodyS" style={styles.rowLabel}>
                  {row.label}
                </Text>
                <Text variant="body" style={styles.rowValue}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {!!activity.note && (
            <View style={styles.noteBlock}>
              <Text variant="bodyS" style={styles.rowLabel}>
                {t("activity:details.note")}
              </Text>
              <Text variant="body" style={styles.rowValue}>
                {activity.note}
              </Text>
            </View>
          )}

          {!!location?.coordinates && (
            <ActivityMap
              style={styles.map}
              markers={[
                {
                  id: activity.id ?? "activity",
                  title: location.label || typeLabel,
                  coordinates: location.coordinates,
                },
              ]}
              center={location.coordinates}
            />
          )}
        </DrawerScrollView>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(16),
    paddingHorizontal: theme.spacing(4),
  },
  rows: {
    gap: theme.spacing(3),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  rowLabel: {
    color: theme.palette.brand.textSecondary,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: "right",
    color: theme.palette.brand.textPrimary,
  },
  noteBlock: {
    gap: theme.spacing(1),
  },
  map: {
    height: theme.spacing(50),
  },
}));
