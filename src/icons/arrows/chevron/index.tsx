import type { IconProps } from "@/icons/icons";
import { Path, StyledSvg as Svg } from "@/icons/StyledSvg";

export const Chevron = ({ style, color = "#000", ...props }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props} style={style}>
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
