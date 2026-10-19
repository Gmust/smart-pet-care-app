import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "../constants";
import type { WeightPoint } from "../types";
import { buildWeightChange } from "../utils/buildWeightChange";
import { buildWeightChart } from "../utils/buildWeightChart";

type WeightCardProps = {
  points: WeightPoint[];
  onHistoryPress: () => void;
};

export const WeightCard = ({ points, onHistoryPress }: WeightCardProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  const [chartWidth, setChartWidth] = useState(0);

  const latest = points.at(-1);
  const change = buildWeightChange(points);

  const chartHeight = theme.spacing(14);
  const dotRadius = theme.spacing(0.75);
  const hasChart = points.length >= 2;
  const chart =
    hasChart && chartWidth > 0
      ? buildWeightChart(points, {
          width: chartWidth,
          height: chartHeight,
          inset: dotRadius + theme.spacing(0.5),
        })
      : null;

  const handleChartLayout = (event: LayoutChangeEvent) =>
    setChartWidth(event.nativeEvent.layout.width);

  if (!latest) return null;

  const sign = change === null || change.deltaKg === 0 ? "" : change.deltaKg > 0 ? "+" : "−";

  return (
    <Card
      radius="loose"
      padding="none"
      style={styles.card}
      pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
      onPress={onHistoryPress}
      accessibilityLabel={t("feeding:weight.history")}
    >
      <View style={styles.header}>
        <Text variant="titleM" style={styles.value}>
          {t("feeding:weight.value", { weight: latest.weightKg })}
        </Text>
        {change !== null && (
          <Chip
            size="sm"
            variant="ghost"
            tone="neutral"
            label={t("feeding:weight.sinceChange", {
              delta: `${sign}${Math.abs(change.deltaKg)}`,
              date: dayjs(change.since).format("MMM D"),
            })}
          />
        )}
      </View>

      {hasChart && (
        <View style={{ height: chartHeight }} onLayout={handleChartLayout}>
          {!!chart && (
            <Svg width={chartWidth} height={chartHeight}>
              <Path
                d={chart.path}
                fill="none"
                stroke={theme.palette.brand.peachDefault}
                strokeWidth={theme.spacing(0.375)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chart.dots.map((dot, index) => (
                <Circle
                  key={`${dot.x}-${dot.y}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={dotRadius}
                  fill={
                    index === chart.dots.length - 1
                      ? theme.palette.brand.peachDefault
                      : theme.palette.brand.peachMid
                  }
                />
              ))}
            </Svg>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text variant="bodySemiBold" style={styles.historyLabel}>
          {t("feeding:weight.history")}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    boxShadow: theme.shadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  value: {
    color: theme.palette.brand.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  historyLabel: {
    color: theme.palette.brand.primaryDefault,
  },
}));
