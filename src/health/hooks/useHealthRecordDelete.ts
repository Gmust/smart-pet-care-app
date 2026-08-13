import { useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import type { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";

import { useDeleteHealthRecordMutation } from "../queries/useDeleteHealthRecordMutation";

type PendingRecord = { id: string; title: string };

export function useHealthRecordDelete(petId: string | undefined) {
  const { t } = useTranslation(["health"]);
  const [pendingRecord, setPendingRecord] = useState<PendingRecord | null>(null);

  const { mutateAsync: deleteRecord, isPending: isDeleting } = useDeleteHealthRecordMutation();

  const requestDelete = (record: PendingRecord) => setPendingRecord(record);
  const close = () => setPendingRecord(null);

  const confirmDelete = async () => {
    if (!pendingRecord || !petId) return;
    await deleteRecord({ petId, recordId: pendingRecord.id });
  };

  const dialogProps: ComponentProps<typeof DeleteConfirmDialog> = {
    isOpen: pendingRecord !== null,
    setIsOpen: (open) => !open && close(),
    title: t("health:deleteDialog.title"),
    description: t("health:deleteDialog.description", { name: pendingRecord?.title ?? "" }),
    isDeleting,
    onConfirm: confirmDelete,
  };

  return { requestDelete, dialogProps };
}
