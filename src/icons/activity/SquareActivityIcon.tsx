import type { Icon, IconProps } from "../icons";
import { Path, Rect, StyledSvg as Svg } from "../StyledSvg";

export const SquareActivityIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
      <Rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 12h-2l-2 5-2-10-2 5H7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
