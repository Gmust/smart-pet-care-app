type SignalStatus = "ok" | "warn";

export type Signal = {
  label: string;
  value: string;
  status: SignalStatus;
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
