import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const CrossIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M19 5 5 19"
      stroke={color}
      strokeWidth="2.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 5 19 19"
      stroke={color}
      strokeWidth="2.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
