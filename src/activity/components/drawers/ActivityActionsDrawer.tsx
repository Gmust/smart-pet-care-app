import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { ActivityLogResponseDto } from "@/api/generated";
import { LayoutListIcon } from "@/icons/layout-list";
import { PencilLineIcon } from "@/icons/pencil-line";
import { TrashIcon } from "@/icons/trash";
import { Button } from "@/shadecn/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/shadecn/ui/drawer";

import { ACTIVITY_TYPE_ICON } from "../../constants";

type Props = {
  activity: ActivityLogResponseDto | null;
  onClose: () => void;
  onShowDetails: (activity: ActivityLogResponseDto) => void;
  onEdit: (activity: ActivityLogResponseDto) => void;
  onDelete: (activity: ActivityLogResponseDto) => void;
};

export const ActivityActionsDrawer = ({
  activity,
  onClose,
  onShowDetails,
  onEdit,
  onDelete,
}: Props) => {
  const { t } = useTranslation(["activity"]);
  const { theme } = useUnistyles();

  if (!activity) return null;

  const TypeIcon = activity.type ? ACTIVITY_TYPE_ICON[activity.type] : LayoutListIcon;
  const typeLabel = activity.type
    ? t(`activity:types.${activity.type}`)
    : t("activity:types.Other");

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent snapPoints={["45%"]} enableDynamicSizing={false}>
        <DrawerHeader>
          <DrawerTitle>{typeLabel}</DrawerTitle>
        </DrawerHeader>

        <View style={styles.actions}>
          <Button
            size="lg"
            variant="secondary"
            // Button tints only its loading spinner, not a passed icon, so the
            // icon carries the variant's own content color.
            icon={
              <TypeIcon
                width={theme.iconSize.xl}
                height={theme.iconSize.xl}
                color={styles.secondaryIcon.color}
              />
            }
            onPress={() => onShowDetails(activity)}
          >
            {t("activity:actions.showDetails")}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            icon={
              <PencilLineIcon
                width={theme.iconSize.xl}
                height={theme.iconSize.xl}
                color={styles.secondaryIcon.color}
              />
            }
            onPress={() => onEdit(activity)}
          >
            {t("activity:actions.edit")}
          </Button>

          <Button
            size="lg"
            variant="danger"
            icon={
              <TrashIcon
                width={theme.iconSize.xl}
                height={theme.iconSize.xl}
                color={styles.dangerIcon.color}
              />
            }
            onPress={() => onDelete(activity)}
          >
            {t("activity:actions.delete")}
          </Button>
        </View>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  actions: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
  secondaryIcon: {
    color: theme.palette.brand.primaryDark,
  },
  dangerIcon: {
    color: theme.palette.brand.danger,
  },
}));
