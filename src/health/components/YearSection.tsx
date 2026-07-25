import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SectionHeader } from "@/common/components/SectionHeader";

type Props = {
  label: string;
  children: ReactNode;
};

export function YearSection({ label, children }: Props) {
  return (
    <View style={styles.section}>
      <SectionHeader label={label} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing(2),
  },
}));
