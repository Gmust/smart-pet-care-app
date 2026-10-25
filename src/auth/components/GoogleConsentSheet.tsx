import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { PRIVACY_URL, TERMS_URL } from "@/common/utils/legalUrls";
import { Button } from "@/shadecn/ui/button";
import { DrawerFooter, DrawerHeader, DrawerTitle, useDrawerClose } from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { LegalLinkRow } from "./LegalLinkRow";

interface GoogleConsentSheetProps {
  onAgree: () => void;
}

export const GoogleConsentSheet = ({ onAgree }: GoogleConsentSheetProps) => {
  const { t } = useTranslation(["auth"]);
  const close = useDrawerClose();

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{t("auth:agreements.title")}</DrawerTitle>
      </DrawerHeader>

      <View style={styles.links}>
        <Text variant="body" style={styles.description}>
          {t("auth:agreements.description")}
        </Text>
        <LegalLinkRow label={t("auth:agreements.terms")} url={TERMS_URL} />
        <LegalLinkRow label={t("auth:agreements.privacy")} url={PRIVACY_URL} />
      </View>

      <DrawerFooter>
        <Button
          variant="primary"
          onPress={() => {
            onAgree();
            close();
          }}
        >
          {t("auth:agreements.agree")}
        </Button>
        <Button variant="text" size="inline" onPress={close} style={styles.cancel}>
          {t("auth:agreements.cancel")}
        </Button>
      </DrawerFooter>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  links: {
    gap: theme.spacing(3),
  },
  description: {
    color: theme.palette.brand.textSecondary,
  },
  cancel: {
    alignSelf: "center",
  },
}));
