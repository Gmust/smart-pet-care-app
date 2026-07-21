import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  children: React.ReactNode;
};

export function HistoryGrid({ children }: Props) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(3),
  },
}));
