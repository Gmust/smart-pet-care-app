import type { Icon } from "../icons";
import { TrendingDownIcon } from "./TrendingDownIcon";
import { TrendingUpIcon } from "./TrendingUpIcon";

type TrendingIcons = {
  Down: Icon;
  Up: Icon;
};

const Trending: TrendingIcons = {
  Down: TrendingDownIcon,
  Up: TrendingUpIcon,
};

export { TrendingDownIcon, TrendingUpIcon };
export default Trending;
