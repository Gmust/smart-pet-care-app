import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { openLegalUrl, PRIVACY_URL, TERMS_URL } from "@/common/utils/legalUrls";
import { Button } from "@/shadecn/ui/button";

export const LegalLinks = () => {
  const { t } = useTranslation(["auth"]);

  return (
    <View style={styles.links}>
      <Button variant="link" size="md" onPress={() => openLegalUrl(TERMS_URL)}>
        {t("auth:agreements.terms")}
      </Button>
      <Button variant="link" size="md" onPress={() => openLegalUrl(PRIVACY_URL)}>
        {t("auth:agreements.privacy")}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
}));
