import type { Icon, IconProps } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

export const BugOffIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
      <Path
        d="M12 20v-8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.656 7H14a4 4 0 0 1 4 4v1.344"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.12 3.88 16 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.123 17.123A6 6 0 0 1 6 14v-3a4 4 0 0 1 1.72-3.287"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m2 2 20 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 5a4 4 0 0 1-3.55 3.97"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 13h-3.344"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 21a4 4 0 0 1 3.81-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 5a4 4 0 0 0 3.55 3.97"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 13H2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m8 2 1.88 1.88"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.712 4.06A3 3 0 0 1 15 6v1.13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
