import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const ScaleIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
      <Path
        d="M12 3v18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m19 8 3 8a5 5 0 0 1-6 0zV7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m5 8 3 8a5 5 0 0 1-6 0zV7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 21h10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
