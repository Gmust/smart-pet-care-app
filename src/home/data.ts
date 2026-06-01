import { SquareActivityIcon } from "@/icons/activity";
import { BellIcon } from "@/icons/bell";
import { BriefcaseMedicalIcon } from "@/icons/briefcase-medical";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { ThermometerIcon } from "@/icons/thermometer";
import { UtensilsIcon } from "@/icons/utensils";

import type {
  AiInsight,
  HealthSummary,
  PetSummary,
  QuickActionItem,
  Reminder,
  TimelineEvent,
} from "./types";

export const greeting = {
  date: "Tuesday · Apr 20",
  username: "Alex",
};

export const activePet: PetSummary = {
  name: "Miso",
  breed: "Domestic",
};

export const healthSummary = {
  petName: "Miso",
  score: 78,
  status: "Stable — keep an eye on appetite",
  trendLabel: "Stable",
  signals: {
    weight: { value: "4.1 kg", status: "warn" as const },
    appetite: { value: "Low 3d", status: "warn" as const },
    activity: { value: "Normal", status: "ok" as const },
  },
};

export const aiInsight: AiInsight = {
  timeAgo: "2h ago",
  message: "Miso's appetite has dropped 28% this week. Consider a gentle check-in.",
};

export const reminders: Reminder[] = [
  {
    id: "meloxicam",
    icon: SyringeIcon,
    tone: "primary",
    title: "Meloxicam · 0.5 ml",
    time: "8:00 AM",
    status: "done",
  },
  {
    id: "lunch",
    icon: UtensilsIcon,
    tone: "peach",
    title: "Lunch — 85g wet",
    time: "12:30 PM",
    status: "next",
  },
  {
    id: "weigh-in",
    icon: StethoscopeIcon,
    tone: "warn",
    title: "Weigh-in & note",
    time: "6:00 PM",
    status: "pending",
  },
];

export const quickActions: QuickActionItem[] = [
  { id: "meal", icon: UtensilsIcon, label: "Log a meal" },
  { id: "symptom", icon: ThermometerIcon, label: "Note a symptom" },
  { id: "file", icon: BriefcaseMedicalIcon, label: "Upload vet file" },
  { id: "reminder", icon: BellIcon, label: "Set reminder" },
];

export const recentEvents: TimelineEvent[] = [
  {
    id: "dinner",
    icon: UtensilsIcon,
    title: "Dinner — 90g renal wet",
    meta: "Yesterday · 6:04 PM",
    dot: "ok",
  },
  {
    id: "weighed",
    icon: SquareActivityIcon,
    title: "Weighed in · 4.1 kg",
    meta: "Sun · −0.1 kg",
    dot: "warn",
  },
  {
    id: "vet-call",
    icon: StethoscopeIcon,
    title: "Vet call · Dr. Nakamura",
    meta: "Thu · 30 min",
    dot: "primary",
  },
];
