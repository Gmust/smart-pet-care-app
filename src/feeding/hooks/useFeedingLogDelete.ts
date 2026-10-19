import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteFeedingLogMutation } from "../queries/useDeleteFeedingLogMutation";

type PendingMeal = { id: string; title: string };

export const useFeedingLogDelete = (petId: string | undefined) => {
  const { t } = useTranslation(["feeding", "common"]);
  const [pendingMeal, setPendingMeal] = useState<PendingMeal | null>(null);

  const { mutateAsync: deleteLog, isPending: isDeleting } = useDeleteFeedingLogMutation();

  const requestDelete = (meal: PendingMeal) => setPendingMeal(meal);
  const close = () => setPendingMeal(null);

  const confirmDelete = async () => {
    // The dialog closes on confirm regardless, so a missing id or pet has to be
    // reported — otherwise a no-op reads as a successful delete.
    if (!pendingMeal || !petId) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }
    await deleteLog({ petId, logId: pendingMeal.id });
    Toast.show({ type: "success", text1: t("feeding:deleteDialog.mealSuccess") });
  };

  const dialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: pendingMeal !== null,
    setIsOpen: (open) => !open && close(),
    title: t("feeding:deleteDialog.mealTitle"),
    description: t("feeding:deleteDialog.mealDescription", { name: pendingMeal?.title ?? "" }),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
};
