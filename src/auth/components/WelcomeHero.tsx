import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Image } from "expo-image";

const heroSilhouette = require("../../../assets/images/onboarding/hero-silhouette.png");

export function WelcomeHero() {
  return (
    <View style={styles.container}>
      <Image source={heroSilhouette} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: theme.spacing(40),
    height: theme.spacing(40),
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: theme.spacing(40),
    height: theme.spacing(40),
    opacity: 0.23,
  },
}));
