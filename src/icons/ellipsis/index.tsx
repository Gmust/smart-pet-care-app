import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const EllipsisIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M8 12h.01M12 12h.01M16 12h.01"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
