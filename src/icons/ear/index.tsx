import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const EarIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
      <Path
        d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
