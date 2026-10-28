import type { Icon, IconProps } from "../icons";
import { Path, Rect, StyledSvg as Svg } from "../StyledSvg";

export const MicIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Rect x="9" y="3" width="6" height="11" rx="3" stroke={color} strokeWidth="2" />
    <Path
      d="M5 11a7 7 0 0 0 14 0M12 18v3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
