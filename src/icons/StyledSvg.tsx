import type { DimensionValue } from "react-native";
import type { SvgProps } from "react-native-svg";
import { Svg } from "react-native-svg";

const parseDimention = (value?: string | number): DimensionValue | undefined => {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    return value as DimensionValue | undefined;
  }
  return parsed;
};

export const StyledSvg = ({ width, height, style, ...props }: SvgProps) => {
  return (
    <Svg
      style={[{ width: parseDimention(width), height: parseDimention(height) }, style]}
      {...props}
    />
  );
};
export * from "react-native-svg";
