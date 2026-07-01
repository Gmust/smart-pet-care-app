import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { useDeleteRemindersMutation } from "../queries/useDeleteRemindersMutation";

export function useReminderActions() {
  const { t } = useTranslation(["reminders", "common"]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editReminderId, setEditReminderId] = useState<string | null>(null);
  const [statusReminderId, setStatusReminderId] = useState<string | null>(null);

  const {
    mutateAsync: deleteReminder,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteRemindersMutation();

  const handleDeleteReminder = useCallback(
    async (id: string) => {
      try {
        await deleteReminder(id);
        Toast.show({ type: "success", text1: t("reminders:deleteSuccessMessage") });
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      }
    },
    [deleteReminder, t]
  );

  return {
    isCreateOpen,
    setIsCreateOpen,
    editReminderId,
    setEditReminderId,
    statusReminderId,
    setStatusReminderId,
    isDeleting,
    deletingId,
    handleDeleteReminder,
  };
}
