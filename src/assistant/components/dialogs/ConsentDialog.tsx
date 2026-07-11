import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";
import { Text } from "@/shadecn/ui/text";

type Props = {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
};

export const ConsentDialog = ({ isOpen, onOpenChange, onAccept, onDecline }: Props) => {
  const { t } = useTranslation(["assistant"]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle style={styles.dialogTitle}>{t("consent.title")}</DialogTitle>
        </DialogHeader>
        <Text style={styles.body}>{t("consent.information")}</Text>
        <Text style={styles.body}>{t("consent.privacy")}</Text>
        <Text accessibilityRole="alert" style={styles.emergencyText}>
          {t("consent.emergency")}
        </Text>
        <DialogFooter>
          <Button onPress={onAccept}>{t("consent.accept")}</Button>
          <Button variant="ghost" onPress={onDecline}>
            {t("consent.decline")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create((theme) => ({
  dialogTitle: {
    fontFamily: theme.fonts.display,
    textTransform: "none",
    color: theme.palette.brand.textPrimary,
  },
  body: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.5,
    color: theme.palette.brand.textBody,
    textAlign: "center",
  },
  emergencyText: {
    textAlign: "center",
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.danger,
    lineHeight: theme.fontSize.base * 1.5,
  },
}));
