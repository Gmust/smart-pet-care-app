import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChevronIcon } from "@/icons/chevron";
import { palette } from "@/styles/palette";

type ScrollToEndButtonProps = {
  onPress: () => void;
};

export const ScrollToEndButton = forwardRef<
  ComponentRef<typeof TouchableOpacity>,
  ScrollToEndButtonProps
>(({ onPress }, ref) => {
  const { t } = useTranslation(["assistant"]);

  return (
    <TouchableOpacity
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={t("conversation.scrollToEnd")}
      onPress={onPress}
      style={styles.scrollToEndButton}
    >
      <ChevronIcon direction="down" width={20} height={20} color={palette.brand.primaryDefault} />
    </TouchableOpacity>
  );
});

ScrollToEndButton.displayName = "ScrollToEndButton";

const styles = StyleSheet.create((theme) => ({
  scrollToEndButton: {
    position: "absolute",
    right: theme.spacing(4),
    bottom: theme.spacing(4),
    width: theme.spacing(10),
    height: theme.spacing(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
}));
