import type { Icon } from "../icons";
import { HeartPlusIcon } from "./HeartPlusIcon";
import { HeartPulseIcon } from "./HeartPulseIcon";

type HeartIcons = {
  Plus: Icon;
  Pulse: Icon;
};

const Heart: HeartIcons = {
  Plus: HeartPlusIcon,
  Pulse: HeartPulseIcon,
};

export { HeartPlusIcon, HeartPulseIcon };
export default Heart;
