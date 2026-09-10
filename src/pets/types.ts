type PetStatusTone = "ok" | "warn";

export type PetNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PetFlag = {
  id: string;
  label: string;
  tone: PetStatusTone;
};
