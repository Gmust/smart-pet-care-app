import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { HealthRecordResponseDto } from "@/api/generated";

import type { HealthRecordYearGroup } from "../utils/groupHealthRecordsByYear";

import { HealthRecordCard } from "./HealthRecordCard";
import { YearSection } from "./YearSection";

type Props = {
  groups: HealthRecordYearGroup[];
  resolveLabel: (year: number) => string;
  symptomLabelByName: Map<string, string>;
  onEdit: (record: HealthRecordResponseDto) => void;
  onRequestDelete: (record: HealthRecordResponseDto) => void;
};

export function HealthRecordListSection({
  groups,
  resolveLabel,
  symptomLabelByName,
  onEdit,
  onRequestDelete,
}: Props) {
  return (
    <View style={styles.stack}>
      {groups.map((group) => (
        <YearSection key={group.year} label={resolveLabel(group.year)}>
          <View style={styles.cards}>
            {group.records.map((record) => (
              <HealthRecordCard
                key={record.id ?? `${record.title}-${record.performedAt}`}
                record={record}
                symptomLabelByName={symptomLabelByName}
                onEdit={onEdit}
                onRequestDelete={onRequestDelete}
              />
            ))}
          </View>
        </YearSection>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(5),
  },
  cards: {
    gap: theme.spacing(2),
  },
}));
