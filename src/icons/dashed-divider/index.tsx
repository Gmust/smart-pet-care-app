import type { Icon, IconProps } from "../icons";
import { Line, StyledSvg as Svg } from "../StyledSvg";

export const DashedDividerIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="100%" height={1} style={style} {...props}>
    <Line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={color} strokeWidth={1} strokeDasharray="5,5" />
  </Svg>
);
