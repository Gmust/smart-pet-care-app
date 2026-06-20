import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const WeightIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M6.5 8h11l1.8 11.2A2 2 0 0 1 17.3 21H6.7a2 2 0 0 1-2-1.8L6.5 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 8a3 3 0 0 1 6 0M9 13c.8-.7 1.8-.7 2.6 0s1.8.7 2.6 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
