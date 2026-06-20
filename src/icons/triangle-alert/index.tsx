import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const TriangleAlertIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M10.3 4.2 2.6 17.4A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.6L13.7 4.2a2 2 0 0 0-3.4 0Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
