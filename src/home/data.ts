import { SquareActivityIcon } from "@/icons/activity";
import { BellIcon } from "@/icons/bell";
import { BriefcaseMedicalIcon } from "@/icons/briefcase-medical";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { ThermometerIcon } from "@/icons/thermometer";
import { UtensilsIcon } from "@/icons/utensils";

import type {
  AiInsight,
  PetHealth,
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

export const pets: PetHealth[] = [
  {
    id: "miso",
    petName: "Miso",
    score: 78,
    status: "Stable — keep an eye on appetite",
    trendLabel: "Stable",
    signals: {
      weight: { value: "4.1 kg", status: "warn" },
      appetite: { value: "Low 3d", status: "warn" },
      activity: { value: "Normal", status: "ok" },
    },
  },
  {
    id: "luna",
    petName: "Luna",
    score: 92,
    status: "Thriving — great week overall",
    trendLabel: "Rising",
    signals: {
      weight: { value: "3.6 kg", status: "ok" },
      appetite: { value: "Healthy", status: "ok" },
      activity: { value: "High", status: "ok" },
    },
  },
  {
    id: "biscuit",
    petName: "Biscuit",
    score: 64,
    status: "Needs attention — low activity",
    trendLabel: "Dipping",
    signals: {
      weight: { value: "6.2 kg", status: "warn" },
      appetite: { value: "Normal", status: "ok" },
      activity: { value: "Low 5d", status: "warn" },
    },
  },
];

export const aiInsight: AiInsight = {
  timeAgo: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
