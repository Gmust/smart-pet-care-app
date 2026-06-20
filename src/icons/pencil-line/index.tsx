import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const PencilLineIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Path
      d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
