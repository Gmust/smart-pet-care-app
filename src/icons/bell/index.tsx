import type { Icon } from "../icons";
import { BellIcon } from "./BellIcon";
import { BellPlusIcon } from "./BellPlusIcon";
import { BellRingIcon } from "./BellRingIcon";

type BellIcons = {
  Default: Icon;
  Plus: Icon;
  Ring: Icon;
};

const Bell: BellIcons = {
  Default: BellIcon,
  Plus: BellPlusIcon,
  Ring: BellRingIcon,
};

export { BellIcon, BellPlusIcon, BellRingIcon };
export default Bell;
