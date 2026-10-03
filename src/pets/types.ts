type PetStatusTone = "ok" | "warn";

export type PetFlag = {
  id: string;
  label: string;
  tone: PetStatusTone;
};
