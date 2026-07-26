import type { Icon } from "../icons";
import { CalendarHeartIcon } from "./CalendarHeartIcon";
import { CalendarSearchIcon } from "./CalendarSearchIcon";

type CalendarIcons = {
  Heart: Icon;
  Search: Icon;
};

const Calendar: CalendarIcons = {
  Heart: CalendarHeartIcon,
  Search: CalendarSearchIcon,
};

export { CalendarHeartIcon, CalendarSearchIcon };
export default Calendar;
