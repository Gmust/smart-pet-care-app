import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import type { PetWeightLogResponseDto } from "@/api/generated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";
import { Text } from "@/shadecn/ui/text";

type WeightEntryRowProps = {
  entry: PetWeightLogResponseDto;
  weightKg: number;
  onEdit: (entry: PetWeightLogResponseDto) => void;
  onDelete: (entry: PetWeightLogResponseDto) => void;
};

export const WeightEntryRow = ({ entry, weightKg, onEdit, onDelete }: WeightEntryRowProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  const date = dayjs(entry.measuredAt).format("MMM DD, YYYY");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${date}, ${t("feeding:weight.value", { weight: weightKg })}`}
          style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
        >
          <Text variant="body" style={styles.date}>
            {date}
          </Text>
          <Text variant="body" style={styles.value}>
            {t("feeding:weight.value", { weight: weightKg })}
          </Text>
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={-theme.spacing(4)}>
        <DropdownMenuItem onPress={() => onEdit(entry)}>
          <Text variant="bodySemiBold" style={styles.menuItemText}>
            {t("feeding:meals.menu.edit")}
          </Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => onDelete(entry)}>
          <Text variant="bodySemiBold" style={[styles.menuItemText, styles.menuItemTextDanger]}>
            {t("feeding:meals.menu.delete")}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
    minHeight: theme.minTouchTarget,
  },
  rootPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  date: {
    color: theme.palette.brand.textSecondary,
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: theme.palette.brand.textPrimary,
  },
  menuItemText: {
    color: theme.palette.brand.textPrimary,
  },
  menuItemTextDanger: {
    color: theme.palette.brand.danger,
  },
}));
