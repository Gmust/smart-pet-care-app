import type { ReminderStatus } from "@/api";
import type { Icon } from "@/icons/icons";

export type ReminderTone = "primary" | "peach" | "warn";

export type Reminder = {
  id: string;
  icon: Icon;
  tone: ReminderTone;
  title: string;
  time: string;
  status: ReminderStatus;
};
