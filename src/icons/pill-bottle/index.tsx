import type { Icon, IconProps } from "../icons";
import { Path, Rect, StyledSvg as Svg } from "../StyledSvg";

export const PillBottleIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      width="16"
      height="5"
      x="4"
      y="2"
      rx="1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
