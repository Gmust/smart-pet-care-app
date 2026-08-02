import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type Props = {
  title: string;
  time: string;
};

export function MealRowContent({ title, time }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" style={styles.time}>
        {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  time: {
    color: theme.palette.brand.textSecondary,
  },
}));
