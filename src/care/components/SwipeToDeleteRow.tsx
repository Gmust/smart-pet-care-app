import { type ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Swipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TrashIcon } from "@/icons/trash";

type Props = {
  onDelete: () => void;
  disabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  actionVariant?: "circle" | "fill";
  children: ReactNode;
};

export function SwipeToDeleteRow({
  onDelete,
  disabled,
  isFirst = false,
  isLast = false,
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

  const cornerStyle = styles.corners(isFirst, isLast);

  return (
    <Swipeable
      ref={ref}
      friction={2}
      overshootRight={false}
      rightThreshold={40}
      // Transparent, unrounded — purely a gesture container, not a visual layer.
      containerStyle={[styles.container, !isFirst && styles.overlapSeam]}
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
              <TrashIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={theme.palette.white}
              />
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
            <TrashIcon
              width={theme.iconSize.xl}
              height={theme.iconSize.xl}
              color={theme.palette.white}
            />
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
  corners: (isFirst: boolean, isLast: boolean) => ({
    borderTopLeftRadius: isFirst ? theme.borderRadius.xl : 0,
    borderTopRightRadius: isFirst ? theme.borderRadius.xl : 0,
    borderBottomLeftRadius: isLast ? theme.borderRadius.xl : 0,
    borderBottomRightRadius: isLast ? theme.borderRadius.xl : 0,
  }),
  fillAction: {
    width: theme.spacing(13.75),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.danger,
  },
  fillActionPressed: {
    opacity: 0.85,
  },
  circleWrap: {
    width: theme.spacing(13.75),
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.danger,
  },
  circleButtonPressed: {
    opacity: 0.8,
  },
}));
