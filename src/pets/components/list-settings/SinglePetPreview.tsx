import { Circle, Path, Rect, StyledSvg as Svg } from "@/icons/StyledSvg";
import { palette } from "@/styles/palette";

const { brand, white } = palette;

export const SinglePetPreview = () => (
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
    <Rect x="96" y="8" width="24" height="14" rx="7" fill={brand.surfaceBorder} />
    <Circle cx="103" cy="15" r="5.5" fill={white} />
    <Rect
      x="9.5"
      y="7.5"
      width="61"
      height="17"
      rx="8.5"
      fill={white}
      stroke={brand.surfaceBorder}
    />
    <Circle cx="18" cy="16" r="5" fill={brand.primaryMid} />
    <Rect x="27" y="14" width="20" height="4" rx="2" fill={brand.textSecondary} />
    <Path
      d="M52.5 13.5 56 17l-3.5 3.5"
      stroke={brand.textSecondary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="10" y="32" width="110" height="38" rx="10" fill={brand.primaryMid} />
    <Rect x="10" y="78" width="70" height="6" rx="3" fill={brand.surfaceSunken} />
    <Rect x="10" y="90" width="44" height="6" rx="3" fill={brand.surfaceSunken} />
  </Svg>
);
