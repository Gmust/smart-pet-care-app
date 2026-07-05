import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { CareCategory, DayOfWeek, PlannedHealthEventCategory, RecurrenceType } from "../types";
import { CareCategoryIcon } from "./care-category-icon/CareCategoryIcon";
import { RecurrenceChip } from "./RecurrenceChip";

type CareRuleCardSize = "lg" | "sm";

type Props = {
  category: CareCategory | PlannedHealthEventCategory;
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
  /** "lg" — single-rule sections (Vet Visit). "sm" — rows inside a list
   * (Grooming, Treatments, and growableList sections once they hold 2+ rules). */
  size?: CareRuleCardSize;
  onPress?: () => void;
};

export function CareRuleCard({
  category,
  title,
  time,
  recurrenceType,
  intervalN,
  weekDays,
  size = "sm",
  onPress,
}: Props) {
  cardVariants.useVariants({ size });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${time}`}
      onPress={onPress}
      style={({ pressed }) => [cardVariants.card, pressed && cardVariants.cardPressed]}
    >
      <View style={cardVariants.row}>
        <View style={cardVariants.iconBox}>
          <CareCategoryIcon
            category={category}
            width={size === "lg" ? 20 : 16}
            height={size === "lg" ? 20 : 16}
            color={palette.brand.peachDefault}
          />
        </View>
        <View style={cardVariants.textCol}>
          <Text style={cardVariants.title}>{title}</Text>
          <Text style={cardVariants.time}>{time}</Text>
        </View>
        <RecurrenceChip recurrenceType={recurrenceType} intervalN={intervalN} weekDays={weekDays} />
      </View>
    </Pressable>
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
