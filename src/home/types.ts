import type { Icon } from "@/icons/icons";

export type SignalStatus = "ok" | "warn";
export type ReminderTone = "primary" | "peach" | "warn";
export type ReminderStatus = "done" | "next" | "pending";
export type TimelineDot = "ok" | "warn" | "primary";

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

export type QuickActionItem = {
  id: string;
  icon: Icon;
  label: string;
};

export type TimelineEvent = {
  id: string;
  icon: Icon;
  title: string;
  meta: string;
  dot: TimelineDot;
};

export type HealthSignal = {
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

export type PetSummary = {
  name: string;
  breed: string;
};

export type AiInsight = {
  timeAgo: Date;
  message: string;
};
