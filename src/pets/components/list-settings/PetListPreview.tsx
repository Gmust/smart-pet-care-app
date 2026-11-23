import { Circle, Rect, StyledSvg as Svg } from "@/icons/StyledSvg";
import { palette } from "@/styles/palette";

const { brand, white } = palette;

const ROW_TOPS = [30.5, 54.5, 78.5];

export const PetListPreview = () => (
  <Svg width="130" height="104" viewBox="0 0 130 104" fill="none">
    <Rect
      x="0.5"
      y="0.5"
      width="129"
      height="103"
      rx="13.5"
      fill={brand.surfacePage}
      stroke={brand.surfaceBorder}
    />
    <Rect x="96" y="8" width="24" height="14" rx="7" fill={brand.primaryDefault} />
    <Circle cx="113" cy="15" r="5.5" fill={white} />
    <Rect x="10" y="10" width="40" height="10" rx="5" fill={brand.surfaceSunken} />
    {ROW_TOPS.map((top) => (
      <Rect
        key={top}
        x="8.5"
        y={top}
        width="113"
        height="19"
        rx="7.5"
        fill={white}
        stroke={brand.surfaceBorder}
      />
    ))}
    {ROW_TOPS.map((top) => (
      <Circle key={`avatar-${top}`} cx="19" cy={top + 9.5} r="5" fill={brand.primaryMid} />
    ))}
    {ROW_TOPS.map((top) => (
      <Rect
        key={`name-${top}`}
        x="30"
        y={top + 5.5}
        width="54"
        height="4"
        rx="2"
        fill={brand.surfaceSunken}
      />
    ))}
    {ROW_TOPS.map((top) => (
      <Rect
        key={`meta-${top}`}
        x="30"
        y={top + 11.5}
        width="34"
        height="3"
        rx="1.5"
        fill={brand.surfaceSunken}
      />
    ))}
  </Svg>
);
