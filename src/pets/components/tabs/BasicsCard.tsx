import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type BasicsColumnProps = {
  title: string;
  items: string[];
  emptyLabel: string;
};

function BasicsColumn({ title, items, emptyLabel }: BasicsColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {items.length ? (
          items.map((item, index) => (
            <Text key={index} style={styles.item}>
              {item}
            </Text>
          ))
        ) : (
          <Text style={styles.item}>{emptyLabel}</Text>
        )}
      </View>
    </View>
  );
}

type BasicsCardProps = {
  allergies: string[];
  chronicConditions: string[];
};

export function BasicsCard({ allergies, chronicConditions }: BasicsCardProps) {
  const { t } = useTranslation(["pets"]);
  const emptyLabel = t("petProfilePage.fallbacks.notAdded");

  return (
    <View style={styles.card}>
      <BasicsColumn
        title={t("petProfilePage.basics.allergies")}
        items={allergies}
        emptyLabel={emptyLabel}
      />
      <View style={styles.divider} />
      <BasicsColumn
        title={t("petProfilePage.basics.chronicConditions")}
        items={chronicConditions}
        emptyLabel={emptyLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    overflow: "hidden",
  },
  divider: {
    width: 1,
    backgroundColor: theme.palette.brand.surfaceBorder,
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
    padding: theme.spacing(3.5),
  },
  title: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textPrimary,
  },
  list: {
    gap: theme.spacing(0),
  },
  item: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
  },
}));
