import type { Icon } from "../icons";
import { CirclePlusIcon } from "./CirclePlusIcon";
import { PlusIcon } from "./PlusIcon";

type PlusIcons = {
  Default: Icon;
  Circle: Icon;
};

const Plus: PlusIcons = {
  Default: PlusIcon,
  Circle: CirclePlusIcon,
};

export { CirclePlusIcon, PlusIcon };
export default Plus;
