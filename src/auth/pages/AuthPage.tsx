import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import type { AuthResponse } from "@/api/generated";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { EmailAuthForm } from "../components/EmailAuthForm";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { useAuth } from "../hooks/useAuth";
import type { AuthMode } from "../types";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AuthPage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const { agreed } = useLocalSearchParams<{ agreed?: string }>();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<AuthMode>("register");
  const isRegister = mode === "register";
  const termsPreAccepted = agreed === "1";

  const handleAuthenticated = useCallback(
    async (response: AuthResponse) => {
      await signIn(response);
      router.replace("/(tabs)/home");
    },
    [signIn, router]
  );

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

        <GoogleAuthButton onAuthenticated={handleAuthenticated} />

        <Button variant="link" size="md" onPress={() => setMode(isRegister ? "login" : "register")}>
          {isRegister ? t("auth:actions.switchToLogin") : t("auth:actions.switchToRegister")}
        </Button>
      </ScrollView>
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
  dividerText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    color: theme.palette.brand.textFaint,
  },
}));
