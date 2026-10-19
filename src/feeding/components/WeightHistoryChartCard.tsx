import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import type { WeightPeriod } from "../constants";
import type { WeightPoint } from "../types";
import { buildWeightChart } from "../utils/buildWeightChart";
import { buildWeightPeriodChange } from "../utils/buildWeightPeriodChange";

const X_LABEL_COUNT = 4;

const MAX_HISTORY_POINTS = Infinity;

type WeightHistoryChartCardProps = {
  points: WeightPoint[];
  period: WeightPeriod;
};

export const WeightHistoryChartCard = ({ points, period }: WeightHistoryChartCardProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  const [plotWidth, setPlotWidth] = useState(0);

  const latest = points.at(-1);
  const change = buildWeightPeriodChange(points);

  const plotHeight = theme.spacing(35);
  const dotRadius = theme.spacing(0.75);
  const chart =
    points.length >= 2 && plotWidth > 0
      ? buildWeightChart(points, {
          width: plotWidth,
          height: plotHeight,
          inset: dotRadius + theme.spacing(0.5),
          maxPoints: MAX_HISTORY_POINTS,
        })
      : null;

  const xSamples =
    points.length >= 2
      ? [
          ...new Set(
            Array.from({ length: X_LABEL_COUNT }, (_, index) =>
              Math.round((index * (points.length - 1)) / (X_LABEL_COUNT - 1))
            )
          ),
        ].map((index) => dayjs(points[index]?.measuredAt))
      : [];
  const xLabels = xSamples.map((date) =>
    date.format(
      period === "month" || new Set(xSamples.map((d) => d.month())).size < xSamples.length
        ? "MMM D"
        : "MMM"
    )
  );

  const handlePlotLayout = (event: LayoutChangeEvent) =>
    setPlotWidth(event.nativeEvent.layout.width);

  if (!latest) return null;

  const sign = change === null || change === 0 ? "" : change > 0 ? "+" : "−";
  const yTicks = chart?.scale
    ? [chart.scale.max, (chart.scale.max + chart.scale.min) / 2, chart.scale.min]
    : [];
  const gridLines = [0, plotHeight / 2, plotHeight];

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.header}>
        <Text variant="titleM" style={styles.value}>
          {t("feeding:weight.value", { weight: latest.weightKg })}
        </Text>
        {change !== null && (
          <Chip
            size="sm"
            variant="ghost"
            tone="neutral"
            label={t("feeding:weight.periodChange", {
              delta: `${sign}${Math.abs(change)}`,
              period: t(`feeding:weight.periods.${period}`),
            })}
          />
        )}
      </View>

      {points.length >= 2 && (
        <>
          <View style={styles.plot}>
            <View style={[styles.yAxis, { height: plotHeight }]}>
              {yTicks.map((tick) => (
                <Text key={tick} variant="caption" style={styles.yTick}>
                  {tick.toFixed(1)}
                </Text>
              ))}
            </View>
            <View style={{ height: plotHeight, flex: 1 }} onLayout={handlePlotLayout}>
              {!!chart && (
                <Svg width={plotWidth} height={plotHeight}>
                  {gridLines.map((y) => (
                    <Line
                      key={y}
                      x1={0}
                      x2={plotWidth}
                      y1={y}
                      y2={y}
                      stroke={theme.palette.brand.surfaceBorder}
                      strokeWidth={theme.spacing(0.25)}
                    />
                  ))}
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
          </View>
          <View style={styles.xAxis}>
            {xLabels.map((label, index) => (
              // Samples can repeat a month, so the index is part of the key.

              <Text key={`${label}-${index}`} variant="caption" style={styles.xTick}>
                {label}
              </Text>
            ))}
          </View>
        </>
      )}
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
  plot: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  yAxis: {
    width: theme.spacing(7),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  yTick: {
    color: theme.palette.brand.textFaint,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xTick: {
    color: theme.palette.brand.textSecondary,
  },
}));
