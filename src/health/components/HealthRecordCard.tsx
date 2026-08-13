import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import type { HealthRecordResponseDto } from "@/api/generated";
import { DashedDividerIcon } from "@/icons/dashed-divider";
import { EyeClosedIcon, EyeIcon } from "@/icons/eye";
import { cardVariants } from "@/shadecn/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { HEALTH_CATEGORY_ICON } from "../constants";
import type { HealthHistoryCategory } from "../types";

type Props = {
  record: HealthRecordResponseDto;
  symptomLabelByName: Map<string, string>;
  onEdit: (record: HealthRecordResponseDto) => void;
  onRequestDelete: (record: HealthRecordResponseDto) => void;
};

export function HealthRecordCard({ record, symptomLabelByName, onEdit, onRequestDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation(["health"]);
  const { theme } = useUnistyles();
  cardVariants.useVariants({ padding: "none", radius: "standalone" });

  const symptomLabels = (record.symptoms ?? [])
    .map((symptom) => symptomLabelByName.get(symptom) ?? symptom)
    .join(", ");
  const hasDetails = !!(
    record.provider ||
    record.description ||
    record.dosage ||
    record.nextDueAt ||
    symptomLabels
  );

  // record.type is always one of HealthHistoryCategory here — this card only
  // ever renders records the page already queried for a single validated
  // category (see health-record-list-params.schema).
  const Icon = HEALTH_CATEGORY_ICON[record.type as HealthHistoryCategory];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={record.title}
          style={cardVariants.card}
        >
          <View style={styles.headerBlock}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBg}>
                <Icon
                  width={theme.iconSize.md}
                  height={theme.iconSize.md}
                  color={palette.brand.peachDefault}
                />
              </View>
              <Text variant="body" style={styles.title} numberOfLines={isExpanded ? undefined : 1}>
                {record.title}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text variant="bodyS" style={styles.date}>
                {dayjs(record.performedAt).format("MMM D, YYYY")}
              </Text>
              {hasDetails && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("health:recordList.toggleDetails")}
                  hitSlop={16}
                  onPress={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded ? (
                    <EyeIcon
                      width={theme.iconSize.md}
                      height={theme.iconSize.md}
                      color={palette.brand.textSecondary}
                    />
                  ) : (
                    <EyeClosedIcon
                      width={theme.iconSize.md}
                      height={theme.iconSize.md}
                      color={palette.brand.textSecondary}
                    />
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {isExpanded && (
            <>
              <DashedDividerIcon color={palette.brand.surfaceBorder} />

              <View style={styles.contentBlock}>
                {!!record.provider && (
                  <Text variant="bodyS" style={styles.contentLine}>
                    {t("health:recordList.fields.provider")}: {record.provider}
                  </Text>
                )}
                {!!record.description && (
                  <Text variant="bodyS" style={styles.contentLine}>
                    {t("health:recordList.fields.description")}: {record.description}
                  </Text>
                )}
                {!!record.dosage && (
                  <Text variant="bodyS" style={styles.contentLine}>
                    {t("health:recordList.fields.dosage")}: {record.dosage}
                  </Text>
                )}
                {!!record.nextDueAt && (
                  <Text variant="bodyS" style={styles.contentLine}>
                    {t("health:recordList.fields.nextDueAt")}:{" "}
                    {dayjs(record.nextDueAt).format("MMM D, YYYY")}
                  </Text>
                )}
                {!!symptomLabels && (
                  <Text variant="bodyS" style={styles.contentLine}>
                    {t("health:recordList.fields.symptoms")}: {symptomLabels}
                  </Text>
                )}
              </View>
            </>
          )}
        </Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={-theme.spacing(4)}>
        {hasDetails && (
          <DropdownMenuItem onPress={() => setIsExpanded((prev) => !prev)}>
            <Text variant="bodySemiBold" style={styles.menuItemText}>
              {t(
                isExpanded ? "health:recordList.menu.hideInfo" : "health:recordList.menu.viewInfo"
              )}
            </Text>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onPress={() => onEdit(record)}>
          <Text variant="bodySemiBold" style={styles.menuItemText}>
            {t("health:recordList.menu.edit")}
          </Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => onRequestDelete(record)}>
          <Text variant="bodySemiBold" style={[styles.menuItemText, styles.menuItemTextDanger]}>
            {t("health:recordList.menu.delete")}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const styles = StyleSheet.create((theme) => ({
  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  iconBg: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.peachIconBg,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: theme.palette.brand.textPrimary,
  },
  date: {
    color: theme.palette.brand.textSecondary,
  },
  contentBlock: {
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
  },
  contentLine: {
    color: theme.palette.brand.textSecondary,
  },
  menuItemText: {
    color: theme.palette.brand.textPrimary,
  },
  menuItemTextDanger: {
    color: theme.palette.brand.danger,
  },
}));
