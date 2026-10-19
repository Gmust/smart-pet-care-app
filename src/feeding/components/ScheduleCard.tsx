import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { UtensilsIcon } from "@/icons/utensils";
import { Card } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "../constants";

type ScheduleCardProps = {
  mealsPerDay: number;
  onPress: () => void;
};

export const ScheduleCard = ({ mealsPerDay, onPress }: ScheduleCardProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  return (
    <Card
      padding="none"
      style={styles.card}
      pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
      onPress={onPress}
      accessibilityLabel={t("feeding:schedule.title")}
    >
      <View style={styles.iconBox}>
        <UtensilsIcon
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={theme.palette.brand.peachDefault}
        />
      </View>
      <View style={styles.texts}>
        <Text variant="body" style={styles.title}>
          {t("feeding:schedule.title")}
        </Text>
        <Text variant="bodyS" style={styles.subtitle}>
          {t("feeding:schedule.mealsPerDay", { count: mealsPerDay })}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2.5),
    boxShadow: theme.shadows.card,
  },
  iconBox: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.peachTint,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.75),
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
}));
