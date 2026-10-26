import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { Icon } from "@/icons/icons";
import { Text } from "@/shadecn/ui/text";

type ActionRowProps = {
  icon: Icon;
  label: string;
  tone?: "default" | "danger";
  size?: "md" | "lg";
  // Without `onPress` the row is plain content, for a parent that is already pressable
  // (`DropdownMenuItem`).
  onPress?: () => void;
};

export const ActionRow = ({
  icon: RowIcon,
  label,
  tone = "default",
  size = "md",
  onPress,
}: ActionRowProps) => {
  const { theme } = useUnistyles();

  const isDanger = tone === "danger";
  const isLarge = size === "lg";

  const content = (
    <>
      <View style={[styles.tile, isLarge && styles.tileLarge, isDanger && styles.tileDanger]}>
        <RowIcon
          width={isLarge ? theme.iconSize.xl : theme.iconSize.lg}
          height={isLarge ? theme.iconSize.xl : theme.iconSize.lg}
          color={isDanger ? theme.palette.brand.danger : theme.palette.brand.primaryDefault}
        />
      </View>
      <Text variant="bodySemiBold" style={[styles.label, isDanger && styles.labelDanger]}>
        {label}
      </Text>
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      role="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, styles.pressable, pressed && styles.pressablePressed]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  pressable: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
  },
  pressablePressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  tile: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  tileLarge: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  tileDanger: {
    backgroundColor: theme.palette.brand.dangerBg,
  },
  label: {
    color: theme.palette.brand.textPrimary,
  },
  labelDanger: {
    color: theme.palette.brand.danger,
  },
}));
