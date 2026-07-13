import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useCareDeleteConfirm } from "../hooks/useCareDeleteConfirm";
import { CareDeleteConfirmDialog } from "./CareDeleteConfirmDialog";

type Props<T extends { id: string }> = {
  petId: string;
  deleteItem: (args: { id: string; petId: string }) => Promise<unknown>;
  isDeleting: boolean;
  getName: (item: T) => string;
  children: (requestDelete: (item: T) => void) => ReactNode;
};

export function CareDeleteFlow<T extends { id: string }>({
  petId,
  deleteItem,
  isDeleting,
  getName,
  children,
}: Props<T>) {
  const { t } = useTranslation(["care"]);
  const deleteConfirm = useCareDeleteConfirm<T>();

  return (
    <>
      {children(deleteConfirm.request)}

      <CareDeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        setIsOpen={(open) => !open && deleteConfirm.close()}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", {
          name: deleteConfirm.pendingItem ? getName(deleteConfirm.pendingItem) : "",
        })}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleteConfirm.pendingItem) return;
          await deleteItem({ id: deleteConfirm.pendingItem.id, petId });
        }}
      />
    </>
  );
}
