import { AnimalSpecies } from "@/api/generated";

/** Species the create/edit pickers offer, straight from the backend enum.
 * Unknown is the server's "not set" value, not something a user picks. */
export const PET_SPECIES = Object.values(AnimalSpecies).filter(
  (species): species is Exclude<AnimalSpecies, typeof AnimalSpecies.Unknown> =>
    species !== AnimalSpecies.Unknown
);

/** Frame of a pet's photo. The picker's crop editor, its preview and the profile hero all take it
 * from here, so the crop that is chosen is the crop that is shown. */
export const PET_PHOTO_ASPECT: [number, number] = [16, 9];
export const PET_PHOTO_ASPECT_RATIO = PET_PHOTO_ASPECT[0] / PET_PHOTO_ASPECT[1];

export const BASICS_SEGMENTS = ["allergies", "chronicConditions", "behavioralNotes"] as const;
export type BasicsSegment = (typeof BASICS_SEGMENTS)[number];

export const PET_LIST_SUGGESTION_THRESHOLD = 5;
