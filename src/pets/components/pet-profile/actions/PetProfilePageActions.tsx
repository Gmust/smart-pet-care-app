import { useTranslation } from "react-i18next";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ActionRow } from "@/common/components/ActionRow";
import { TriangleAlertIcon } from "@/icons/alert";
import { EllipsisIcon } from "@/icons/ellipsis";
import { ImageEdit } from "@/icons/image-edit";
import { PencilLineIcon } from "@/icons/pencil-line";
import { Button } from "@/shadecn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";

type PetProfilePageActionsProps = {
  disabled?: boolean;
  onEdit: () => void;
  onChangePhoto: () => void;
  onDelete: () => void;
};

export function PetProfilePageActions({
  disabled = false,
  onEdit,
  onChangePhoto,
  onDelete,
}: PetProfilePageActionsProps) {
  const { t } = useTranslation("pets");
  const { theme } = useUnistyles();

  if (disabled) {
    return (
      <Button
        variant="icon"
        size="icon"
        accessibilityLabel={t("petProfilePage.actions.open")}
        disabled={disabled}
      >
        <EllipsisIcon
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={theme.palette.brand.primaryDark}
        />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        accessibilityRole="button"
        accessibilityLabel={t("petProfilePage.actions.open")}
        style={(state) => [styles.trigger, state.pressed && styles.triggerPressed]}
      >
        <EllipsisIcon
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={theme.palette.brand.primaryDark}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem accessibilityLabel={t("petProfilePage.actions.edit")} onPress={onEdit}>
          <ActionRow icon={PencilLineIcon} label={t("petProfilePage.actions.edit")} />
        </DropdownMenuItem>

        <DropdownMenuItem
          accessibilityLabel={t("petProfilePage.actions.changePhoto")}
          onPress={onChangePhoto}
        >
          <ActionRow icon={ImageEdit} label={t("petProfilePage.actions.changePhoto")} />
        </DropdownMenuItem>

        <DropdownMenuItem
          accessibilityLabel={t("petProfilePage.actions.delete")}
          onPress={onDelete}
        >
          <ActionRow
            icon={TriangleAlertIcon}
            tone="danger"
            label={t("petProfilePage.actions.delete")}
          />
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
}));
