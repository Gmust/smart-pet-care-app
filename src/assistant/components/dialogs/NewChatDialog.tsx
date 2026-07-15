import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";

export function NewChatDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation(["assistant"]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle style={styles.dialogTitle}>{t("conversation.newChatTitle")}</DialogTitle>
          <DialogDescription style={styles.dialogDescription}>
            {t("conversation.confirmReset")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onPress={onConfirm}>{t("conversation.startNewChat")}</Button>
          <Button variant="text" onPress={() => onOpenChange(false)}>
            {t("errors.dismiss")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create((theme) => ({
  dialogTitle: {
    fontFamily: theme.fonts.display,
    textTransform: "none",
    color: theme.palette.brand.textPrimary,
  },
  dialogDescription: {
    textAlign: "center",
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.5,
    color: theme.palette.brand.textBody,
  },
}));
