import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { PetFlag } from "../types";

type FlagChipProps = {
  flag: PetFlag;
};

export function FlagChip({ flag }: FlagChipProps) {
  const chipStyle = flag.tone === "warn" ? styles.warnFlag : styles.okFlag;
  const textStyle = flag.tone === "warn" ? styles.warnFlagText : styles.okFlagText;

  return (
    <View style={[styles.flagChip, chipStyle]}>
      <Text style={[styles.flagText, textStyle]}>{flag.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  flagChip: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing(2.75),
    paddingVertical: theme.spacing(1.25),
  },
  okFlag: {
    borderColor: theme.palette.brand.primaryDefault,
    backgroundColor: "rgba(26,58,46,0.4)",
  },
  warnFlag: {
    borderColor: theme.palette.brand.peachDefault,
    backgroundColor: "rgba(122,58,26,0.5)",
  },
  flagText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
  },
  okFlagText: {
    color: theme.palette.brand.textOnDark,
  },
  warnFlagText: {
    color: theme.palette.brand.peachIconBg,
  },
}));
