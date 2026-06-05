import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
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
import { Text } from "@/shadecn/ui/text";

// TODO(content): replace with the production legal pages once they exist.
const TERMS_URL = "https://smart-pet-care.duckdns.org/legal/terms";
const PRIVACY_URL = "https://smart-pet-care.duckdns.org/legal/privacy";

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

        <View style={styles.links}>
          <Button variant="link" onPress={() => Linking.openURL(TERMS_URL)} size="md">
            <Text>{t("auth:agreements.terms")}</Text>
          </Button>
          <Button variant="link" onPress={() => Linking.openURL(PRIVACY_URL)} size="md">
            <Text>{t("auth:agreements.privacy")}</Text>
          </Button>
        </View>

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
  links: {
    flexDirection: "row",
    justifyContent: "center",
  },
  description: {
    textAlign: "center",
  },
}));
