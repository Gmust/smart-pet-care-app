import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { InfoIcon } from "@/icons/info";
import { Text } from "@/shadecn/ui/text";

type CalloutProps = {
  tone?: "peach" | "sunken";
  children: ReactNode;
};

export const Callout = ({ tone = "peach", children }: CalloutProps) => {
  const { theme } = useUnistyles();

  if (tone === "sunken") {
    return (
      <View style={[styles.root, styles.sunken]}>
        <InfoIcon
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={theme.palette.brand.textSecondary}
        />
        <Text variant="bodyS" style={styles.text}>
          {children}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, styles.peach]}>
      <Text variant="bodyS" style={[styles.text, styles.centered]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  peach: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.peachTint,
    paddingHorizontal: theme.spacing(2.75),
    paddingVertical: theme.spacing(2.5),
  },
  sunken: {
    alignItems: "flex-start",
    gap: theme.spacing(2.5),
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(3),
  },
  text: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
  centered: {
    textAlign: "center",
  },
}));
