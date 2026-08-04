import type { Icon } from "../icons";

import { CircleAlertIcon } from "./CircleAlertIcon";
import { TriangleAlertIcon } from "./TriangleAlertIcon";

type AlertIcons = {
  Circle: Icon;
  Triangle: Icon;
};

const Alert: AlertIcons = {
  Circle: CircleAlertIcon,
  Triangle: TriangleAlertIcon,
};

export { CircleAlertIcon, TriangleAlertIcon };
export default Alert;
