import type { Icon } from "../icons";
import { Path, StyledSvg as Svg } from "../StyledSvg";

type Direction = "left" | "right" | "up" | "down";

const ROTATION: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

export const ChevronIcon: Icon<{ direction?: Direction }> = ({
  style,
  color = "#000000",
  direction = "right",
  ...props
}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={style} {...props}>
    {/* Rotate the path, not the root Svg: iOS ignores transforms on the root element. */}
    <Path
      d="m9 18 6-6-6-6"
      rotation={ROTATION[direction]}
      origin="12, 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
