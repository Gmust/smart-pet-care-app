import { Trans, useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { AnyFieldApi } from "@tanstack/react-form";

import { useVisibleFieldErrors } from "@/common/hooks/useVisibleFieldErrors";
import { openLegalUrl, PRIVACY_URL, TERMS_URL } from "@/common/utils/legalUrls";
import { Checkbox } from "@/shadecn/ui/checkbox";
import { FieldError } from "@/shadecn/ui/field-error";
import { Text } from "@/shadecn/ui/text";

interface SignUpConsentProps {
  field: AnyFieldApi;
}

export const SignUpConsent = ({ field }: SignUpConsentProps) => {
  const { t } = useTranslation(["auth"]);

  const errors = useVisibleFieldErrors(field);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox
          checked={field.state.value}
          onCheckedChange={field.handleChange}
          accessibilityLabel={t("auth:agreements.consentLabel")}
        />
        <Text variant="bodyS" style={styles.text}>
          <Trans
            t={t}
            i18nKey="auth:agreements.consent"
            components={{
              terms: (
                <Text
                  variant="controlM"
                  accessibilityRole="link"
                  style={styles.link}
                  onPress={() => openLegalUrl(TERMS_URL)}
                />
              ),
              privacy: (
                <Text
                  variant="controlM"
                  accessibilityRole="link"
                  style={styles.link}
                  onPress={() => openLegalUrl(PRIVACY_URL)}
                />
              ),
            }}
          />
        </Text>
      </View>
      <FieldError errors={errors} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(1),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  text: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
  link: {
    color: theme.palette.brand.primaryDefault,
  },
}));
