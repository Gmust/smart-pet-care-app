import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";

type Props = DialogHandler & {
  title: string;
  description: string;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function CareDeleteConfirmDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  isDeleting,
  onConfirm,
}: Props) {
  const { t } = useTranslation(["care", "common"]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="danger"
            size="md"
            isLoading={isDeleting}
            disabled={isDeleting}
            onPress={handleConfirm}
          >
            {t("care:deleteDialog.confirm")}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" size="md" disabled={isDeleting}>
              {t("care:deleteDialog.cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
