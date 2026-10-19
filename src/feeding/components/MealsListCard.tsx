import { StyleSheet } from "react-native-unistyles";

import type { FeedingLogResponseDto } from "@/api/generated";
import { ListCard } from "@/shadecn/ui/card";

import type { FeedingListRow, FeedingSlot } from "../types";

import { MealRow } from "./MealRow";

type MealsListCardProps = {
  rows: FeedingListRow[];
  onEdit: (log: FeedingLogResponseDto) => void;
  onDelete: (log: FeedingLogResponseDto) => void;
  onLogSlot: (slot: FeedingSlot) => void;
};

export const MealsListCard = ({ rows, onEdit, onDelete, onLogSlot }: MealsListCardProps) => {
  return (
    <ListCard style={styles.card}>
      {rows.map((row) => (
        <MealRow
          key={row.key}
          row={row}
          onEdit={onEdit}
          onDelete={onDelete}
          onLogSlot={onLogSlot}
        />
      ))}
    </ListCard>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    boxShadow: theme.shadows.card,
  },
}));
