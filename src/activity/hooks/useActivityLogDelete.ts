import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteActivityLogMutation } from "../queries/useDeleteActivityLogMutation";

type PendingActivity = { id: string; title: string };

export function useActivityLogDelete(petId: string | undefined) {
  const { t } = useTranslation(["activity", "common"]);
  const [pendingActivity, setPendingActivity] = useState<PendingActivity | null>(null);

  const { mutateAsync: deleteActivity, isPending: isDeleting } = useDeleteActivityLogMutation();

  const requestDelete = (activity: PendingActivity) => setPendingActivity(activity);
  const close = () => setPendingActivity(null);

  const confirmDelete = async () => {
    // The dialog closes on confirm regardless, so a missing id or pet has to be
    // reported — otherwise a no-op reads as a successful delete.
    if (!pendingActivity || !petId) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }
    await deleteActivity({ petId, activityLogId: pendingActivity.id });
  };

  const dialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: pendingActivity !== null,
    setIsOpen: (open) => !open && close(),
    title: t("activity:deleteDialog.title"),
    description: t("activity:deleteDialog.description", { name: pendingActivity?.title ?? "" }),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
}
