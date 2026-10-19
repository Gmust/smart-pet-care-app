import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteNutritionGoalMutation } from "../queries/useDeleteNutritionGoalMutation";

export const useNutritionGoalDelete = (petId: string | undefined) => {
  const { t } = useTranslation(["feeding", "common"]);
  const [isRequested, setIsRequested] = useState(false);

  const { mutateAsync: deleteGoal, isPending: isDeleting } = useDeleteNutritionGoalMutation();

  const requestDelete = () => setIsRequested(true);

  const confirmDelete = async () => {
    if (!petId) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }
    await deleteGoal(petId);
    Toast.show({ type: "success", text1: t("feeding:forms.goal.deleteSuccess") });
  };

  const dialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: isRequested,
    setIsOpen: setIsRequested,
    title: t("feeding:deleteDialog.goalTitle"),
    description: t("feeding:deleteDialog.goalDescription"),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
};
