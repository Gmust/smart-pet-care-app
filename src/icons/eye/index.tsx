import type { Icon } from "../icons";

import { EyeClosedIcon } from "./EyeClosedIcon";
import { EyeIcon } from "./EyeIcon";

type EyeIcons = {
  Default: Icon;
  Closed: Icon;
};

const Eye: EyeIcons = {
  Default: EyeIcon,
  Closed: EyeClosedIcon,
};

export { EyeClosedIcon, EyeIcon };
export default Eye;
