import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import { DashedDividerIcon } from "@/icons/dashed-divider";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import type { WeekSummary } from "../types";

const VALUES_SHOWN_MS = 3000;

const HOLD_DELAY_MS = 300;

type WeekBarsCardProps = {
  week: WeekSummary;
};

export const WeekBarsCard = ({ week }: WeekBarsCardProps) => {
  const { t, i18n } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();
  const [valuesMode, setValuesMode] = useState<"off" | "tap" | "hold">("off");

  const { metric, bars, average, target, deviationPct } = week;

  const scaleMax = Math.max(target ?? 0, ...bars.map((bar) => bar.value));
  const percentOf = (value: number) => (scaleMax > 0 ? (value / scaleMax) * 100 : 0);

  useEffect(() => {
    if (valuesMode !== "tap") return;
    const timer = setTimeout(() => setValuesMode("off"), VALUES_SHOWN_MS);
    return () => clearTimeout(timer);
  }, [valuesMode]);

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      {/* A tap shows the numbers for a moment; a hold keeps them while the finger is down. */}
      <Pressable
        accessible={false}
        testID="week-card"
        style={styles.content}
        onPress={() => setValuesMode((mode) => (mode === "off" ? "tap" : "off"))}
        delayLongPress={HOLD_DELAY_MS}
        onLongPress={() => setValuesMode("hold")}
        onPressOut={() => setValuesMode((mode) => (mode === "hold" ? "off" : mode))}
      >
        <View style={styles.chart}>
          <View style={styles.plot}>
            <View style={styles.bars}>
              {bars.map((bar) => {
                const value = Math.round(bar.value);
                const day = bar.isToday
                  ? t("feeding:week.today")
                  : dayjs(bar.date).toDate().toLocaleDateString(i18n.language, { weekday: "long" });

                return (
                  <View
                    key={bar.date}
                    accessible
                    accessibilityLabel={t(
                      metric === "calories"
                        ? "feeding:week.barLabel"
                        : "feeding:week.barLabelMeals",
                      { day, value }
                    )}
                    style={styles.barSlot}
                  >
                    <View
                      style={[
                        styles.bar,
                        bar.isToday && styles.barToday,
                        { height: `${percentOf(bar.value)}%` },
                      ]}
                    />
                    {valuesMode !== "off" && value > 0 && (
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={[
                          styles.value,
                          bar.isToday && styles.valueToday,
                          { bottom: `${percentOf(bar.value)}%` },
                        ]}
                      >
                        {value}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {target !== null && (
              <DashedDividerIcon
                color={theme.palette.brand.textSecondary}
                style={[styles.goalLine, { bottom: `${percentOf(target)}%` }]}
              />
            )}
          </View>
        </View>

        <View style={styles.labels}>
          {bars.map((bar) => (
            <View key={bar.date} style={styles.labelSlot}>
              <Text
                variant="caption"
                numberOfLines={1}
                style={[styles.label, bar.isToday && styles.labelToday]}
              >
                {bar.isToday
                  ? t("feeding:week.today")
                  : dayjs(bar.date)
                      .toDate()
                      .toLocaleDateString(i18n.language, { weekday: "narrow" })}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text variant="bodyS" style={styles.average}>
            {average === null
              ? ""
              : metric === "calories"
                ? t("feeding:week.average", { calories: average })
                : t("feeding:week.averageMeals", { value: average })}
          </Text>

          {deviationPct !== null && (
            <Chip
              size="sm"
              tone={deviationPct === 0 ? "ok" : "warn"}
              label={
                deviationPct === 0
                  ? t("feeding:week.onGoal")
                  : t(deviationPct < 0 ? "feeding:week.belowGoal" : "feeding:week.aboveGoal", {
                      percent: Math.abs(deviationPct),
                    })
              }
            />
          )}
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    boxShadow: theme.shadows.card,
  },
  content: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  // Room above the tallest bar for its number.
  chart: {
    height: theme.spacing(19.5),
  },
  plot: {
    position: "absolute",
    top: theme.spacing(4),
    left: 0,
    right: 0,
    bottom: 0,
  },
  bars: {
    height: "100%",
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  barSlot: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-end",
  },
  labelSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  bar: {
    width: "100%",
    minHeight: theme.spacing(0.5),
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.palette.brand.primarySoft,
  },
  barToday: {
    backgroundColor: theme.palette.brand.peachMid,
  },
  value: {
    position: "absolute",
    left: 0,
    right: 0,
    marginBottom: theme.spacing(0.5),
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  valueToday: {
    color: theme.palette.brand.peachDefault,
  },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  labels: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  label: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  labelToday: {
    color: theme.palette.brand.textPrimary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  average: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
}));
