import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { AgreementsDialog } from "../components/AgreementsDialog";
import { WelcomeHero } from "../components/WelcomeHero";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const peekingCat = require("../../../assets/images/onboarding/peeking-cat.png");

export default function WelcomePage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const [agreementsOpen, setAgreementsOpen] = useState(false);

  const handleAgree = () => {
    setAgreementsOpen(false);
    router.push({ pathname: "/(auth)/sign-in", params: { agreed: "1" } });
  };

  return (
    <LinearGradient
      colors={[palette.brand.primaryXsoft, palette.brand.surfacePage]}
      locations={[0, 0.75]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <WelcomeHero />

          <Text style={styles.title}>{t("auth:welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("auth:welcome.subtitle")}</Text>

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <View pointerEvents="none" style={styles.catWrap}>
              <Image source={peekingCat} style={styles.cat} contentFit="contain" />
            </View>
            <Button
              size="lg"
              variant="primary"
              style={styles.cta}
              onPress={() => setAgreementsOpen(true)}
            >
              {t("auth:welcome.getStarted")}
            </Button>
          </View>
        </View>
      </SafeAreaView>

      <AgreementsDialog
        open={agreementsOpen}
        onOpenChange={setAgreementsOpen}
        onAgree={handleAgree}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create((theme) => ({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(5),
    gap: theme.spacing(8),
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["3xl"],
    lineHeight: theme.textSizing(2.25),
    textAlign: "center",
    color: theme.palette.brand.textBody,
    letterSpacing: -0.25,
  },
  subtitle: {
    maxWidth: theme.spacing(78),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.textSizing(1.4),
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  catWrap: {
    position: "absolute",
    bottom: theme.spacing(9),
    width: theme.spacing(42),
    height: theme.spacing(21),
    zIndex: 12,
  },
  cat: {
    width: "100%",
    height: "100%",
  },
  cta: {
    width: "100%",
    height: theme.spacing(13.5),
    borderRadius: theme.borderRadius.lg,
    zIndex: 1,
  },
}));
