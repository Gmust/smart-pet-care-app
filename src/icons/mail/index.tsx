import type { Icon, IconProps } from "../icons";
import { Path, Rect, StyledSvg as Svg } from "../StyledSvg";

export const MailIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
