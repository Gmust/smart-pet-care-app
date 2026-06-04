import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CatIcon } from "@/icons/pets";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

export default function PetsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <CatIcon width={48} height={48} color={palette.brand.primaryDefault} />
        <Text style={styles.title}>Pets</Text>
        <Text style={styles.subtitle}>Your pets will live here soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["3xl"],
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textSecondary,
  },
}));
