import { useEffect, useRef } from "react";
import { AccessibilityInfo, findNodeHandle, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

export function FocusHeading({ text }: { text: string }) {
  const ref = useRef<View>(null);

  useEffect(() => {
    const node = findNodeHandle(ref.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, []);

  return (
    <View ref={ref} accessible accessibilityRole="header" accessibilityLabel={text}>
      <Text variant="titleL" style={styles.title}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    color: theme.palette.brand.textPrimary,
  },
}));
