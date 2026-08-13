import { StyleSheet } from "react-native-unistyles";

import { PlusIcon } from "@/icons/plus";
import { Button } from "@/shadecn/ui/button";
import { palette } from "@/styles/palette";

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function AddButton({ onPress, accessibilityLabel }: Props) {
  return (
    <Button
      variant="icon"
      size="icon"
      style={styles.button}
      accessibilityLabel={accessibilityLabel}
      icon={<PlusIcon width={18} height={18} color={palette.white} />}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.palette.brand.primaryDark,
    borderRadius: theme.borderRadius.full,
  },
}));
