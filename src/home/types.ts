export type PetHealth = {
  id: string;
  petName: string;
  species: string | null;
  photoUrl: string | null;
};

export type AiInsight = {
  timeAgo: Date;
  message: string;
};

export type Signal = {
  label: string;
  status: "ok" | "warn";
  value: string;
};
