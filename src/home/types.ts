import type { ReminderStatus } from "@/api";
import type { Icon } from "@/icons/icons";

type SignalStatus = "ok" | "warn";
export type ReminderTone = "primary" | "peach" | "warn";

export type Signal = {
  label: string;
  value: string;
  status: SignalStatus;
};

export type Reminder = {
  id: string;
  icon: Icon;
  tone: ReminderTone;
  title: string;
  time: string;
  status: ReminderStatus;
};

type HealthSignal = {
  value: string;
  status: SignalStatus;
};

export type PetHealth = {
  id: string;
  petName: string;
  score: number;
  status: string;
  trendLabel: string;
  signals: {
    weight: HealthSignal;
    appetite: HealthSignal;
    activity: HealthSignal;
  };
};

export type AiInsight = {
  timeAgo: Date;
  message: string;
};
