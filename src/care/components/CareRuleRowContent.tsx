import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { CareCategory, DayOfWeek, PlannedHealthEventCategory, RecurrenceType } from "../types";
import { CareCategoryIcon } from "./care-category-icon/CareCategoryIcon";
import { RecurrenceChip } from "./RecurrenceChip";

type CareRuleRowSize = "lg" | "sm";

type Props = {
  category: CareCategory | PlannedHealthEventCategory;
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
  /** "lg" — standalone single-rule card (Vet Visit, or a growableList section
   * with exactly one rule). "sm" — a row inside CareListCard. */
  size?: CareRuleRowSize;
};

/**
 * Pure presentational content — icon + title/time + recurrence chip, no
 * border/padding of its own. The border/padding comes from whichever
 * container renders it: CareRuleCard (standalone) or CareListCard (list row).
 */
export function CareRuleRowContent({
  category,
  title,
  time,
  recurrenceType,
  intervalN,
  weekDays,
  size = "sm",
}: Props) {
  rowVariants.useVariants({ size });

  return (
    <View style={rowVariants.row}>
      <View style={rowVariants.iconBox}>
        <CareCategoryIcon
          category={category}
          width={size === "lg" ? 20 : 16}
          height={size === "lg" ? 20 : 16}
          color={palette.brand.peachDefault}
        />
      </View>
      <View style={rowVariants.textCol}>
        <Text style={rowVariants.title}>{title}</Text>
        <Text style={rowVariants.time}>{time}</Text>
      </View>
      <RecurrenceChip recurrenceType={recurrenceType} intervalN={intervalN} weekDays={weekDays} />
    </View>
  );
}

const rowVariants = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    variants: {
      size: {
        lg: { gap: theme.spacing(3.5) },
        sm: { gap: theme.spacing(3) },
      },
    },
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.peachIconBg,
    variants: {
      size: {
        lg: { width: theme.spacing(11), height: theme.spacing(11) },
        sm: { width: theme.spacing(9), height: theme.spacing(9) },
      },
    },
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    color: theme.palette.brand.textPrimary,
    variants: {
      size: {
        lg: { fontSize: theme.fontSize.base },
        sm: { fontSize: theme.fontSize.sm },
      },
    },
  },
  time: {
    marginTop: theme.spacing(0.5),
    fontFamily: theme.fonts.regular,
    color: theme.palette.brand.textSecondary,
    variants: {
      size: {
        lg: { fontSize: theme.fontSize.sm },
        sm: { fontSize: theme.fontSize.xs },
      },
    },
  },
}));
