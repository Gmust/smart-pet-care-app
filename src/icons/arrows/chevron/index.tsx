import { IconProps } from "@/icons/icons";
import { StyledSvg as Svg, Path } from "@/icons/StyledSvg";

export const Chevron = ({ style, color = "#000", ...props }: IconProps) => {
  return (
    <Svg width="6" height="11" viewBox="0 0 6 11" fill="none" {...props} style={style}>
      <Path
        d="M5.25 9.75L0.75 5.25L5.25 0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
