import { AnimalSpecies } from "@/api/generated";

/** Species the create/edit pickers offer, straight from the backend enum.
 * Unknown is the server's "not set" value, not something a user picks. */
export const PET_SPECIES = Object.values(AnimalSpecies).filter(
  (species): species is Exclude<AnimalSpecies, typeof AnimalSpecies.Unknown> =>
    species !== AnimalSpecies.Unknown
);
