import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteWeightLogMutation } from "../queries/useDeleteWeightLogMutation";

export const useWeightLogDelete = (petId: string | undefined) => {
  const { t } = useTranslation(["feeding", "common"]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { mutateAsync: deleteLog, isPending: isDeleting } = useDeleteWeightLogMutation();

  const requestDelete = (weightLogId: string) => setPendingId(weightLogId);

  const confirmDelete = async () => {
    if (!pendingId || !petId) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }
    await deleteLog({ petId, weightLogId: pendingId });
    Toast.show({ type: "success", text1: t("feeding:deleteDialog.weightSuccess") });
  };

  const dialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: pendingId !== null,
    setIsOpen: (open) => !open && setPendingId(null),
    title: t("feeding:deleteDialog.weightTitle"),
    description: t("feeding:deleteDialog.weightDescription"),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
};
