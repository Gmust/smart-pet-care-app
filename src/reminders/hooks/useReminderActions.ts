import { useCallback, useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteRemindersMutation } from "../queries/useDeleteRemindersMutation";

type PendingReminder = { id: string; title: string };

export function useReminderActions() {
  const { t } = useTranslation(["reminders", "common"]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editReminderId, setEditReminderId] = useState<string | null>(null);
  const [statusReminderId, setStatusReminderId] = useState<string | null>(null);
  const [descriptionReminderId, setDescriptionReminderId] = useState<string | null>(null);
  const [pendingDeleteReminder, setPendingDeleteReminder] = useState<PendingReminder | null>(null);

  const {
    mutateAsync: deleteReminder,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteRemindersMutation();

  const requestDeleteReminder = useCallback(
    (reminder: PendingReminder) => setPendingDeleteReminder(reminder),
    []
  );

  const confirmDeleteReminder = useCallback(async () => {
    if (!pendingDeleteReminder) return;
    await deleteReminder(pendingDeleteReminder.id);
    Toast.show({ type: "success", text1: t("reminders:deleteSuccessMessage") });
  }, [deleteReminder, pendingDeleteReminder, t]);

  const deleteDialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: pendingDeleteReminder !== null,
    setIsOpen: (open) => !open && setPendingDeleteReminder(null),
    title: t("reminders:deleteDialog.title"),
    description: t("reminders:deleteDialog.description", {
      name: pendingDeleteReminder?.title ?? "",
    }),
    isDeleting,
    onConfirm: confirmDeleteReminder,
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    editReminderId,
    setEditReminderId,
    statusReminderId,
    setStatusReminderId,
    descriptionReminderId,
    setDescriptionReminderId,
    isDeleting,
    deletingId,
    requestDeleteReminder,
    deleteDialogProps,
  };
}
