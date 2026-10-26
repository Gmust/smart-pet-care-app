import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { AuthBackground } from "../components/AuthBackground";
import { AuthSwitchRow } from "../components/AuthSwitchRow";
import { HeroSilhouette } from "../components/HeroSilhouette";
import { PeekingCat } from "../components/PeekingCat";

const HERO_OPACITY = 0.15;

export default function WelcomePage() {
  const { t } = useTranslation(["auth"]);
  const { theme } = useUnistyles();
  const router = useRouter();

  return (
    <AuthBackground>
      <View style={styles.content}>
        <View style={styles.intro}>
          <HeroSilhouette size={theme.spacing(50.25)} opacity={HERO_OPACITY} style={styles.hero} />

          <Text variant="display" style={styles.title}>
            {t("auth:welcome.title")}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            {t("auth:welcome.subtitle")}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button variant="primary" onPress={() => router.push("/(auth)/sign-up")}>
            {t("auth:welcome.getStarted")}
          </Button>
          <PeekingCat style={styles.cat} />
          <AuthSwitchRow
            tone="body"
            prompt={t("auth:footer.haveAccount")}
            action={t("auth:footer.signIn")}
            onPress={() => router.push("/(auth)/sign-in")}
          />
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    gap: theme.spacing(8),
    padding: theme.spacing(5),
  },
  intro: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(8),
  },
  hero: {
    marginTop: theme.spacing(13.75),
  },
  title: {
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  subtitle: {
    maxWidth: theme.spacing(71.25),
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  actions: {
    gap: theme.spacing(4),
  },
  // Laid over the top edge of the button, after it in the tree so it paints on top.
  cat: {
    position: "absolute",
    top: -theme.spacing(17.75),
    alignSelf: "center",
  },
}));
