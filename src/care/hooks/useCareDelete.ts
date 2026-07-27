import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import type { CareDeleteConfirmDialog } from "../components/CareDeleteConfirmDialog";

type PendingItem = { id: string; name: string };

type Params = {
  petId: string;
  deleteItem: (args: { id: string; petId: string }) => Promise<unknown>;
  isDeleting: boolean;
};

export function useCareDelete({ petId, deleteItem, isDeleting }: Params) {
  const { t } = useTranslation(["care"]);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  const requestDelete = (item: PendingItem) => setPendingItem(item);
  const close = () => setPendingItem(null);

  const confirmDelete = async () => {
    if (!pendingItem) return;
    await deleteItem({ id: pendingItem.id, petId });
  };

  const dialogProps: ComponentProps<typeof CareDeleteConfirmDialog> = {
    isOpen: pendingItem !== null,
    setIsOpen: (open) => !open && close(),
    title: t("deleteDialog.title"),
    description: t("deleteDialog.description", { name: pendingItem?.name ?? "" }),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
}
