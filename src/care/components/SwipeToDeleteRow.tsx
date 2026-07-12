import { type ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Swipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Trash2Icon } from "@/icons/general";

type Props = {
  onDelete: () => void;
  disabled?: boolean;
  topRadius?: number;
  bottomRadius?: number;
  actionVariant?: "circle" | "fill";
  children: ReactNode;
};

export function SwipeToDeleteRow({
  onDelete,
  disabled,
  topRadius = 0,
  bottomRadius = 0,
  actionVariant = "fill",
  children,
}: Props) {
  const { t } = useTranslation(["care"]);
  const { theme } = useUnistyles();
  const ref = useRef<SwipeableMethods>(null);

  if (disabled) return children;

  const handlePress = () => {
    ref.current?.close();
    onDelete();
  };

  const cornerStyle = {
    borderTopLeftRadius: topRadius,
    borderTopRightRadius: topRadius,
    borderBottomLeftRadius: bottomRadius,
    borderBottomRightRadius: bottomRadius,
  };

  return (
    <Swipeable
      ref={ref}
      friction={2}
      overshootRight={false}
      rightThreshold={40}
      // Transparent, unrounded — purely a gesture container, not a visual layer.
      containerStyle={[styles.container, topRadius === 0 && styles.overlapSeam]}
      childrenContainerStyle={[
        { backgroundColor: theme.palette.white, overflow: "hidden" },
        cornerStyle,
      ]}
      renderRightActions={() =>
        actionVariant === "circle" ? (
          <View style={styles.circleWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("actions.delete")}
              onPress={handlePress}
              style={({ pressed }) => [styles.circleButton, pressed && styles.circleButtonPressed]}
            >
              <Trash2Icon width={18} height={18} color={theme.palette.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("actions.delete")}
            onPress={handlePress}
            style={({ pressed }) => [
              styles.fillAction,
              cornerStyle,
              pressed && styles.fillActionPressed,
            ]}
          >
            <Trash2Icon width={20} height={20} color={theme.palette.white} />
          </Pressable>
        )
      }
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: "transparent",
  },
  overlapSeam: {
    marginTop: -1,
  },
  fillAction: {
    width: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.danger,
  },
  fillActionPressed: {
    opacity: 0.85,
  },
  circleWrap: {
    width: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.danger,
  },
  circleButtonPressed: {
    opacity: 0.8,
  },
}));
