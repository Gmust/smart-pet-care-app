import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";

import { LegalLinks } from "./LegalLinks";

interface AgreementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

export function AgreementsDialog({ open, onOpenChange, onAgree }: AgreementsDialogProps) {
  const { t } = useTranslation(["auth"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth:agreements.title")}</DialogTitle>
          <DialogDescription style={styles.description}>
            {t("auth:agreements.description")}
          </DialogDescription>
        </DialogHeader>

        <LegalLinks />

        <DialogFooter>
          <Button size="md" variant="primary" onPress={onAgree}>
            {t("auth:agreements.agree")}
          </Button>
          <DialogClose asChild>
            <Button size="md" variant="danger">
              {t("auth:agreements.cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create(() => ({
  description: {
    textAlign: "center",
  },
}));
