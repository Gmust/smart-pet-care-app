import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { openLegalUrl } from "@/common/utils/legalUrls";
import { ChevronIcon } from "@/icons/chevron";
import { Text } from "@/shadecn/ui/text";

interface LegalLinkRowProps {
  label: string;
  url: string;
}

export const LegalLinkRow = ({ label, url }: LegalLinkRowProps) => {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => openLegalUrl(url)}
      style={({ pressed }) => styles.row(pressed)}
    >
      <Text variant="bodySemiBold" style={styles.label}>
        {label}
      </Text>
      <ChevronIcon
        width={theme.iconSize.lg}
        height={theme.iconSize.lg}
        color={theme.palette.brand.textSecondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: (pressed: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    minHeight: theme.minTouchTarget,
    paddingVertical: theme.spacing(3.5),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(3.5),
    borderRadius: theme.borderRadius.xl,
    backgroundColor: pressed ? theme.palette.brand.surfaceSunken : theme.palette.brand.surfacePage,
  }),
  label: {
    flex: 1,
    color: theme.palette.brand.textPrimary,
  },
}));
