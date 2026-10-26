import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { AuthBackground } from "../components/AuthBackground";
import { AuthDivider } from "../components/AuthDivider";
import { AuthHeader } from "../components/AuthHeader";
import { AuthSwitchRow } from "../components/AuthSwitchRow";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { SignUpForm } from "../components/SignUpForm";
import { useCompleteAuth } from "../hooks/useCompleteAuth";

export default function SignUpPage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const completeAuth = useCompleteAuth();

  return (
    <AuthBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader title={t("auth:screen.registerTitle")} />

        <SignUpForm>
          <AuthDivider />
          <GoogleAuthButton onAuthenticated={completeAuth} />
        </SignUpForm>
      </ScrollView>

      <View style={styles.footer}>
        <AuthSwitchRow
          prompt={t("auth:footer.haveAccount")}
          action={t("auth:footer.signIn")}
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(6),
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(7.5),
    paddingBottom: theme.spacing(5),
  },
  footer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
}));
