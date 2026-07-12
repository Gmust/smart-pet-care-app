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
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.time}>{time}</Text>
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
    ...theme.textStyles.body,
    color: theme.palette.brand.textPrimary,
  },
  time: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
  },
}));
