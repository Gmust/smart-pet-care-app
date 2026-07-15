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
      <Text style={styles.title}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.xl,
    lineHeight: theme.fontSize.xl * 1.3,
    color: theme.palette.brand.textPrimary,
  },
}));
