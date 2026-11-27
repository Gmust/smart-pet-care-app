import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { getLocalTimeOfDay } from "@/common/utils/getLocalTimeOfDay";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { useGetReminderById } from "../queries/useGetReminderById";

type Props = {
  reminderId: string;
  onClose: () => void;
};

export const ReminderDescriptionDrawer = ({ reminderId, onClose }: Props) => {
  const { t } = useTranslation(["reminders"]);
  const { data: reminder, isLoading } = useGetReminderById(reminderId);

  const timeOfDay = getLocalTimeOfDay(reminder);
  const description = reminder?.description?.trim();

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent enableDynamicSizing>
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle>{reminder?.title ?? t("reminders:descriptionDrawer.title")}</DrawerTitle>
          {!!reminder && (
            <Text variant="bodyS" style={styles.meta}>
              {[reminder.type ? t(`reminders:types.${reminder.type}`) : null, timeOfDay]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </DrawerHeader>

        {isLoading ? (
          <View style={styles.body}>
            <ActivityIndicator />
          </View>
        ) : (
          <DrawerScrollView>
            <Text
              variant={description ? "body" : "bodyS"}
              style={description ? styles.description : styles.empty}
            >
              {description ?? t("reminders:descriptionDrawer.empty")}
            </Text>
          </DrawerScrollView>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(1),
  },
  meta: {
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  body: {
    paddingVertical: theme.spacing(6),
    alignItems: "center",
  },
  description: {
    color: theme.palette.brand.textPrimary,
  },
  empty: {
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
}));
