import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SectionHeader } from "@/common/components/SectionHeader";

type Props = {
  title: string;
  children: ReactNode;
};

export function HealthSection({ title, children }: Props) {
  return (
    <View style={styles.block}>
      <SectionHeader label={title} compact />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.spacing(2),
  },
}));
