import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const CheckIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={style} {...props}>
    <Path
      d="M13.3333 4L6 11.3333L2.66667 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
