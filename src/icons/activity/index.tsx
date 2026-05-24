import type { Icon } from "../icons";
import { ActivityIcon } from "./ActivityIcon";
import { SquareActivityIcon } from "./SquareActivityIcon";

type ActivityIcons = {
  Default: Icon;
  Square: Icon;
};

const Activity: ActivityIcons = {
  Default: ActivityIcon,
  Square: SquareActivityIcon,
};

export { ActivityIcon, SquareActivityIcon };
export default Activity;
