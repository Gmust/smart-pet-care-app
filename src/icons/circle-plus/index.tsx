import type { Icon, IconProps } from "../icons";
import { Circle, Path, StyledSvg as Svg } from "../StyledSvg";

export const CirclePlusIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
