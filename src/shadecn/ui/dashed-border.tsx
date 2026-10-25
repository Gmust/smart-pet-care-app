import { useState } from "react";
import { View } from "react-native";
import { Rect, Svg } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type DashedBorderProps = {
  color: string;
  radius: number;
};

// A native dashed border scales its dashes with the line width; Figma wants 5px dashes and gaps.
export const DashedBorder = ({ color, radius }: DashedBorderProps) => {
  const { theme } = useUnistyles();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const stroke = theme.spacing(0.25);
  const dash = theme.spacing(1.25);
  // Android snaps view edges to whole pixels and can clip the line on a canvas of exact size.
  const bleed = theme.spacing(0.5);

  return (
    <View
      pointerEvents="none"
      style={styles.fill}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      {size ? (
        <Svg
          width={size.width + bleed * 2}
          height={size.height + bleed * 2}
          style={styles.canvas(bleed)}
        >
          <Rect
            x={bleed + stroke / 2}
            y={bleed + stroke / 2}
            width={size.width - stroke}
            height={size.height - stroke}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={[dash, dash]}
          />
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  fill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  canvas: (bleed: number) => ({
    position: "absolute",
    top: -bleed,
    left: -bleed,
  }),
}));
