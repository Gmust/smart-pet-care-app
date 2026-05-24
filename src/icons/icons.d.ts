import type { SvgProps } from "react-native-svg";

export type IconProps<T = {}> = SvgProps & T;

export type Icon<T = {}> = React.FC<IconProps<T>>;
