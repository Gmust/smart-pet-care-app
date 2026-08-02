import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Chip } from "@/shadecn/ui/chip";

type Props<T extends string> = {
  options: readonly [T, T];
  optionLabels: readonly [string, string];
  value: T;
  onChange: (value: T) => void;
};

export const BinaryToggle = <T extends string>({
  options,
  optionLabels,
  value,
  onChange,
}: Props<T>) => (
  <View style={styles.chips}>
    {options.map((option, index) => (
      <Chip
        key={option}
        label={optionLabels[index]}
        tone={value === option ? "primary" : "neutral"}
        variant={value === option ? "default" : "ghost"}
        onPress={() => onChange(option)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
  },
}));
