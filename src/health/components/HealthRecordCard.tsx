import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { HealthRecordResponseDto } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { InfoRow } from "@/pets/components/pet-profile/InfoRow";
import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import dayjs from "dayjs";

type Props = {
  record: HealthRecordResponseDto;
  symptomLabelByName: Map<string, string>;
};

export function HealthRecordCard({ record, symptomLabelByName }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation(["health"]);
  cardVariants.useVariants({ padding: "compact", radius: "standalone" });

  const symptomLabels = (record.symptoms ?? [])
    .map((symptom) => symptomLabelByName.get(symptom) ?? symptom)
    .join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={record.title ?? ""}
      onPress={() => setIsExpanded((prev) => !prev)}
      style={[cardVariants.card, styles.card]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTexts}>
          <Text style={styles.title} numberOfLines={isExpanded ? undefined : 1}>
            {record.title}
          </Text>
          <Text style={styles.date}>{dayjs(record.performedAt).format("MMM D, YYYY")}</Text>
        </View>
        <View style={[isExpanded && styles.chevronExpanded]}>
          <ChevronIcon
            direction="down"
            width={16}
            height={16}
            color={palette.brand.textSecondary}
          />
        </View>
      </View>

      {isExpanded && (
        <View style={styles.details}>
          {!!record.provider && (
            <InfoRow label={t("health:recordList.fields.provider")} value={record.provider} />
          )}
          {!!record.description && (
            <InfoRow label={t("health:recordList.fields.description")} value={record.description} />
          )}
          {!!record.dosage && (
            <InfoRow label={t("health:recordList.fields.dosage")} value={record.dosage} />
          )}
          {!!record.nextDueAt && (
            <InfoRow
              label={t("health:recordList.fields.nextDueAt")}
              value={dayjs(record.nextDueAt).format("MMM D, YYYY")}
            />
          )}
          {!!symptomLabels && (
            <InfoRow label={t("health:recordList.fields.symptoms")} value={symptomLabels} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing(2),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  headerTexts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.5),
  },
  title: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textPrimary,
  },
  date: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  details: {
    gap: theme.spacing(1.5),
  },
}));
