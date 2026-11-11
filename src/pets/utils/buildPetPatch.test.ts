/// <reference types="jest" />

import type { PetResponseDto } from "@/api/generated";
import { AnimalSpecies, Sex } from "@/api/generated";

import type { EditPetForm } from "../schemas/create-pet.schema";

import { buildPetPatch } from "./buildPetPatch";

const pet: PetResponseDto = {
  id: "pet-1",
  name: "Miso",
  species: AnimalSpecies.Cat,
  breed: "British Shorthair",
  birthDate: "2021-04-02T00:00:00.000Z",
  weightKg: 3.8,
  sex: Sex.Female,
  allergies: ["Chicken"],
  chronicConditions: null,
};

// What EditPetDrawer seeds the form with for `pet`, including its blank chronic-conditions row.
const formFor = (overrides: Partial<EditPetForm> = {}): EditPetForm => ({
  name: "Miso",
  species: AnimalSpecies.Cat,
  breed: "British Shorthair",
  birthDate: "2021-04-02T00:00:00.000Z",
  sex: Sex.Female,
  allergies: ["Chicken"],
  chronicConditions: [""],
  ...overrides,
});

describe("buildPetPatch", () => {
  it("sends nothing when nothing changed, blank list rows included", () => {
    expect(buildPetPatch(formFor(), pet)).toEqual({});
  });

  it("sends only the field that changed", () => {
    expect(buildPetPatch(formFor({ name: "Mochi" }), pet)).toEqual({ name: "Mochi" });
  });

  it("does not send Unknown back for a pet saved without a species", () => {
    const unknownPet = { ...pet, species: AnimalSpecies.Unknown };
    const dto = buildPetPatch(
      formFor({ species: AnimalSpecies.Unknown, name: "Mochi" }),
      unknownPet
    );

    expect(dto).toEqual({ name: "Mochi" });
  });

  it("sends a newly picked species", () => {
    expect(buildPetPatch(formFor({ species: AnimalSpecies.Rabbit }), pet)).toEqual({
      species: AnimalSpecies.Rabbit,
    });
  });

  // The server reads `breed: null` as "not sent" (`pet_update_empty`); only "" clears it.
  it('clears a blanked breed with "" and ignores whitespace-only edits', () => {
    expect(buildPetPatch(formFor({ breed: "   " }), pet)).toEqual({ breed: "" });
    expect(buildPetPatch(formFor({ breed: " British Shorthair " }), pet)).toEqual({});
  });

  it("does not resend a name or breed stored untrimmed when the form is untouched", () => {
    const untrimmedPet = { ...pet, name: "Miso ", breed: "Syrian " };
    const untouched = formFor({ name: "Miso ", breed: "Syrian " });

    expect(buildPetPatch(untouched, untrimmedPet)).toEqual({});
    expect(buildPetPatch({ ...untouched, sex: Sex.Male }, untrimmedPet)).toEqual({ sex: Sex.Male });
  });

  it("sends trimmed lists without blank rows, and null when every row is removed", () => {
    expect(buildPetPatch(formFor({ chronicConditions: [" Asthma ", ""] }), pet)).toEqual({
      chronicConditions: ["Asthma"],
    });
    expect(buildPetPatch(formFor({ allergies: [""] }), pet)).toEqual({ allergies: null });
  });
});
