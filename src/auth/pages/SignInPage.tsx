import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { AuthBackground } from "../components/AuthBackground";
import { AuthDivider } from "../components/AuthDivider";
import { AuthHeader } from "../components/AuthHeader";
import { AuthSwitchRow } from "../components/AuthSwitchRow";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { SignInForm } from "../components/SignInForm";
import { useCompleteAuth } from "../hooks/useCompleteAuth";

export default function SignInPage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const completeAuth = useCompleteAuth();

  return (
    <AuthBackground hero>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader title={t("auth:screen.loginTitle")} subtitle={t("auth:screen.loginSubtitle")} />

        <SignInForm onAuthenticated={completeAuth}>
          <AuthDivider />
          <GoogleAuthButton onAuthenticated={completeAuth} />
        </SignInForm>
      </ScrollView>

      <View style={styles.footer}>
        <AuthSwitchRow
          prompt={t("auth:footer.newHere")}
          action={t("auth:footer.createAccount")}
          onPress={() => router.replace("/(auth)/sign-up")}
        />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(8),
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(39.5),
    paddingBottom: theme.spacing(5),
  },
  footer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
}));
