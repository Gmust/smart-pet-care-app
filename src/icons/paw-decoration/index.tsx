import type { Icon, IconProps } from "../icons";
import { Ellipse, G, StyledSvg as Svg } from "../StyledSvg";

export const PawDecorationIcon: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="70" height="36.5462" viewBox="0 0 70 36.5462" fill="none" style={style} {...props}>
      <G fill={color}>
        <Ellipse cx="34.4802" cy="25.4351" rx="8" ry="11.1111" />
        <Ellipse cx="19.5" cy="9" rx="6.5" ry="9" />
        <Ellipse cx="49.5" cy="9" rx="6.5" ry="9" />
        <Ellipse cx="63.5" cy="27" rx="6.5" ry="9" />
        <Ellipse cx="6.5" cy="27" rx="6.5" ry="9" />
      </G>
    </Svg>
  );
};
