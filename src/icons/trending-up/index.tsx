import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const TrendingUpIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M3 17 9 11l4 4 8-8M14 7h7v7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
