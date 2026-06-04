import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Dot } from "./Dot";

type DotsIndicatorProps = {
  count: number;
  progress: SharedValue<number>;
};

export function DotsIndicator({ count, progress }: DotsIndicatorProps) {
  return (
    <View style={styles.root}>
      {Array.from({ length: count }).map((_, index) => (
        <Dot key={index} index={index} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
}));
