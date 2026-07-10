import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { CareCategory, DayOfWeek, PlannedHealthEventCategory, RecurrenceType } from "../types";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { SwipeToDeleteRow } from "./SwipeToDeleteRow";

type CareRuleCardSize = "lg" | "sm";

type Props = {
  category: CareCategory | PlannedHealthEventCategory;
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
  /** Standalone-card wrapper — used only for the single-rule state (VetVisit,
   * or a growableList section holding exactly one rule). 2+ rows render
   * CareRuleRowContent directly inside CareListCard instead. */
  size?: CareRuleCardSize;
  onPress?: () => void;
  onDelete?: () => void;
};

export function CareRuleCard({
  category,
  title,
  time,
  recurrenceType,
  intervalN,
  weekDays,
  size = "lg",
  onPress,
  onDelete,
}: Props) {
  const { theme } = useUnistyles();
  cardVariants.useVariants({ size });

  return (
    <SwipeToDeleteRow
      disabled={!onDelete}
      onDelete={() => onDelete?.()}
      topRadius={theme.borderRadius.xl}
      bottomRadius={theme.borderRadius.xl}
      actionVariant="circle"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${time}`}
        onPress={onPress}
        style={({ pressed }) => [cardVariants.card, pressed && cardVariants.cardPressed]}
      >
        <CareRuleRowContent
          category={category}
          title={title}
          time={time}
          recurrenceType={recurrenceType}
          intervalN={intervalN}
          weekDays={weekDays}
          size={size}
        />
      </Pressable>
    </SwipeToDeleteRow>
  );
}

const cardVariants = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    variants: {
      size: {
        lg: { padding: theme.spacing(4) },
        sm: { padding: theme.spacing(3) },
      },
    },
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
