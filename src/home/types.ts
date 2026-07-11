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
