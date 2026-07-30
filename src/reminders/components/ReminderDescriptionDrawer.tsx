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
          <DrawerTitle style={styles.title}>
            {reminder?.title ?? t("reminders:descriptionDrawer.title")}
          </DrawerTitle>
          {!!reminder && (
            <Text style={styles.meta}>
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
            <Text style={description ? styles.description : styles.empty}>
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
  title: {
    fontSize: theme.fontSize.xl,
    letterSpacing: 0,
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  body: {
    paddingVertical: theme.spacing(6),
    alignItems: "center",
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.5,
    color: theme.palette.brand.textPrimary,
  },
  empty: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
}));
