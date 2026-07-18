import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { cardVariants } from "@/shadecn/ui/card";

import type { CareCategory, DayOfWeek, PlannedHealthEventCategory, RecurrenceType } from "../types";
import { CareRuleRowContent } from "./CareRuleRowContent";
import { SwipeToDeleteRow } from "./SwipeToDeleteRow";

type CareRuleCardSize = "lg" | "sm";

const CARD_PADDING_BY_SIZE: Record<CareRuleCardSize, "standalone" | "compact"> = {
  lg: "standalone",
  sm: "compact",
};

type Props = {
  category: CareCategory | PlannedHealthEventCategory;
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
  size?: CareRuleCardSize;
  onPress?: () => void;
  onDelete?: () => void;
};

export const CareRuleCard = ({
  category,
  title,
  time,
  recurrenceType,
  intervalN,
  weekDays,
  size = "lg",
  onPress,
  onDelete,
}: Props) => {
  const { theme } = useUnistyles();
  cardVariants.useVariants({ padding: CARD_PADDING_BY_SIZE[size] });

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
        style={({ pressed }) => [cardVariants.card, pressed && styles.cardPressed]}
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
};

const styles = StyleSheet.create((theme) => ({
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
