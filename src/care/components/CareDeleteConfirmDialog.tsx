import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TrashIcon } from "@/icons/trash";
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
  const { theme } = useUnistyles();

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
        <View style={styles.iconCircle}>
          <TrashIcon
            width={theme.iconSize["2xl"]}
            height={theme.iconSize["2xl"]}
            color={styles.iconColor.color}
          />
        </View>

        <DialogHeader style={styles.header}>
          <DialogTitle style={styles.title}>{title}</DialogTitle>
          <DialogDescription style={styles.description}>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter style={styles.footer}>
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

const styles = StyleSheet.create((theme) => ({
  iconCircle: {
    alignSelf: "center",
    width: theme.spacing(13),
    height: theme.spacing(13),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.dangerBg,
    marginBottom: theme.spacing(1),
  },
  iconColor: {
    color: theme.palette.brand.danger,
  },
  header: {
    gap: theme.spacing(1.5),
  },
  title: {
    ...theme.textStyles.titleM,
    textAlign: "center",
    color: theme.palette.brand.textPrimary,
  },
  description: {
    ...theme.textStyles.body,
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  footer: {
    gap: theme.spacing(2),
  },
}));
