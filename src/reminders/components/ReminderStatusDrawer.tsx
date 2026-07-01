import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

import { ReminderStatus } from "@/api/generated";
import { Button, type ButtonVariant } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { useGetReminderById } from "../queries/useGetReminderById";
import { useUpdateRemindersMutation } from "../queries/useUpdateRemindersMutation";

type Props = {
  reminderId: string;
  onClose: () => void;
  markMissedOnDismiss?: boolean;
};

const STATUS_OPTIONS: { status: ReminderStatus; variant: ButtonVariant }[] = [
  { status: ReminderStatus.Completed, variant: "primary" },
  { status: ReminderStatus.Missed, variant: "danger" },
  { status: ReminderStatus.Cancelled, variant: "secondary" },
];

export const ReminderStatusDrawer = ({
  reminderId,
  onClose,
  markMissedOnDismiss = false,
}: Props) => {
  const { t } = useTranslation(["reminders", "common"]);
  const { data: reminder, isLoading: isReminderLoading } = useGetReminderById(reminderId);
  const { mutateAsync: updateReminder, isPending } = useUpdateRemindersMutation();

  const resolvedRef = useRef(false);

  const applyStatus = async (status: ReminderStatus) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    try {
      await updateReminder({ id: reminderId, payload: { status } });
      Toast.show({ type: "success", text1: t("reminders:statusPrompt.successMessage") });
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
    }
    onClose();
  };

  // From a notification tap, dismissing without choosing marks the reminder as
  // missed. A manual status change just closes without touching the status.
  const handleOpenChange = (open: boolean) => {
    if (open || resolvedRef.current) return;
    resolvedRef.current = true;
    if (markMissedOnDismiss) {
      void updateReminder({
        id: reminderId,
        payload: { status: ReminderStatus.Missed },
      }).catch((e: unknown) => console.error(e));
    }
    onClose();
  };

  const timeOfDay = reminder?.timeOfDay?.match(/\d{2}:\d{2}/)?.[0];

  return (
    <Drawer open onOpenChange={handleOpenChange}>
      <DrawerContent enableDynamicSizing>
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("reminders:statusPrompt.title")}</DrawerTitle>
          <Text style={styles.subtitle}>{t("reminders:statusPrompt.subtitle")}</Text>
        </DrawerHeader>

        {isReminderLoading && (
          <View style={styles.summary}>
            <ActivityIndicator />
          </View>
        )}

        {reminder && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>{reminder.title}</Text>
            <Text style={styles.summaryMeta}>
              {[reminder.type ? t(`reminders:types.${reminder.type}`) : null, timeOfDay]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {STATUS_OPTIONS.map(({ status, variant }) => (
            <Button
              key={status}
              size="lg"
              variant={variant}
              disabled={isPending}
              isLoading={isPending}
              onPress={() => applyStatus(status)}
            >
              {t(`reminders:statusPrompt.status.${status}`)}
            </Button>
          ))}
        </View>
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
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  summary: {
    gap: theme.spacing(1),
    padding: theme.spacing(4),
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  summaryTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textPrimary,
  },
  summaryMeta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  actions: {
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
}));
