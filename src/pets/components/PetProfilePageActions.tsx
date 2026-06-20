import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { EllipsisIcon } from "@/icons/ellipsis";
import { PencilLineIcon } from "@/icons/pencil-line";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { RoundButton } from "./RoundButton";

type PetProfilePageActionsProps = {
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function PetProfilePageActions({
  disabled = false,
  onEdit,
  onDelete,
}: PetProfilePageActionsProps) {
  const { t } = useTranslation("pets");

  if (disabled) {
    return (
      <RoundButton accessibilityLabel={t("petProfilePage.actions.open")}>
        <EllipsisIcon width={16} height={16} color={palette.brand.textBody} />
      </RoundButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        accessibilityRole="button"
        accessibilityLabel={t("petProfilePage.actions.open")}
        style={(state) => [styles.trigger, state.pressed && styles.triggerPressed]}
      >
        <EllipsisIcon width={16} height={16} color={palette.brand.textBody} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem accessibilityLabel={t("petProfilePage.actions.edit")} onPress={onEdit}>
          <View style={styles.itemIcon}>
            <PencilLineIcon width={18} height={18} color={palette.brand.primaryDefault} />
          </View>
          <Text style={styles.itemText}>{t("petProfilePage.actions.edit")}</Text>
        </DropdownMenuItem>

        <DropdownMenuItem
          accessibilityLabel={t("petProfilePage.actions.delete")}
          onPress={onDelete}
        >
          <View style={[styles.itemIcon, styles.itemIconDanger]}>
            <TriangleAlertIcon width={18} height={18} color={palette.brand.danger} />
          </View>
          <Text style={[styles.itemText, styles.itemTextDanger]}>
            {t("petProfilePage.actions.delete")}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.white,
  },
  triggerPressed: {
    opacity: 0.82,
  },
  itemIcon: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  itemIconDanger: {
    backgroundColor: theme.palette.brand.dangerBg,
  },
  itemText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.textPrimary,
  },
  itemTextDanger: {
    color: theme.palette.brand.danger,
  },
}));
