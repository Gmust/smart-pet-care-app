import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { ActivityLogResponseDto } from "@/api/generated";
import { ActionRow } from "@/common/components/ActionRow";
import { LayoutListIcon } from "@/icons/layout-list";
import { PencilLineIcon } from "@/icons/pencil-line";
import { TrashIcon } from "@/icons/trash";
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
          <ActionRow
            size="lg"
            icon={TypeIcon}
            label={t("activity:actions.showDetails")}
            onPress={() => onShowDetails(activity)}
          />
          <ActionRow
            size="lg"
            icon={PencilLineIcon}
            label={t("activity:actions.edit")}
            onPress={() => onEdit(activity)}
          />
          <ActionRow
            size="lg"
            icon={TrashIcon}
            tone="danger"
            label={t("activity:actions.delete")}
            onPress={() => onDelete(activity)}
          />
        </View>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  actions: {
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
}));
