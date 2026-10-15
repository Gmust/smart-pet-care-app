import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { AuthResponse } from "@/api/generated";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { AgreementsDialog } from "../components/AgreementsDialog";
import { EmailAuthForm } from "../components/EmailAuthForm";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { LegalLinks } from "../components/LegalLinks";
import { useAuth } from "../hooks/useAuth";
import type { AuthMode } from "../types";

export default function AuthPage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const { agreed, mode: modeParam } = useLocalSearchParams<{ agreed?: string; mode?: string }>();
  const { signIn } = useAuth();

  // Registering needs the terms accepted first: any entry without `agreed` (confirm-email,
  // a deep link) starts in login and asks before switching to register.
  const [termsPreAccepted, setTermsPreAccepted] = useState(agreed === "1");
  const [mode, setMode] = useState<AuthMode>(
    modeParam !== "login" && termsPreAccepted ? "register" : "login"
  );
  const [agreementsOpen, setAgreementsOpen] = useState(false);
  const isRegister = mode === "register";

  const handleAuthenticated = useCallback(
    async (response: AuthResponse) => {
      await signIn(response);
      router.replace("/(tabs)/home");
    },
    [signIn, router]
  );

  const handleSwitchMode = () => {
    if (isRegister) {
      setMode("login");
      return;
    }
    if (termsPreAccepted) {
      setMode("register");
      return;
    }
    setAgreementsOpen(true);
  };

  const handleAgree = () => {
    setAgreementsOpen(false);
    setTermsPreAccepted(true);
    setMode("register");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isRegister ? t("auth:screen.registerTitle") : t("auth:screen.loginTitle")}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister ? t("auth:screen.registerSubtitle") : t("auth:screen.loginSubtitle")}
          </Text>
        </View>

        <EmailAuthForm
          mode={mode}
          termsPreAccepted={termsPreAccepted}
          onAuthenticated={handleAuthenticated}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("auth:screen.orDivider")}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.google}>
          <GoogleAuthButton onAuthenticated={handleAuthenticated} />
          {/* Google sign-up records acceptance with no checkbox, and a Google sign-in from login
              mode can still create an account: the notice shows in both modes. */}
          <Text variant="caption" style={styles.legalNotice}>
            {t("auth:agreements.googleNotice")}
          </Text>
          <LegalLinks />
        </View>

        <Button variant="link" size="md" onPress={handleSwitchMode}>
          {isRegister ? t("auth:actions.switchToLogin") : t("auth:actions.switchToRegister")}
        </Button>
      </ScrollView>

      <AgreementsDialog
        open={agreementsOpen}
        onOpenChange={setAgreementsOpen}
        onAgree={handleAgree}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(10),
    gap: theme.spacing(6),
  },
  header: {
    gap: theme.spacing(2),
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["3xl"],
    color: theme.palette.brand.textBody,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.4),
    color: theme.palette.brand.textSecondary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  dividerLine: {
    flex: 1,
    height: theme.spacing(0.25),
    backgroundColor: theme.palette.brand.surfaceBorder,
  },
  google: {
    gap: theme.spacing(2),
  },
  legalNotice: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  dividerText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    color: theme.palette.brand.textFaint,
  },
}));
