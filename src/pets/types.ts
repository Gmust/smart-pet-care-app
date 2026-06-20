type PetStatusTone = "ok" | "warn";

export type PetNote = {
  id: string;
  title: string;
  preview: string;
};

export type PetFlag = {
  id: string;
  label: string;
  tone: PetStatusTone;
};
