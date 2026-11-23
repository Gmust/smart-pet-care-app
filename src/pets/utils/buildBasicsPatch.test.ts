/// <reference types="jest" />

import type { PetResponseDto } from "@/api/generated";

import { buildBasicsPatch } from "./buildBasicsPatch";

const pet: PetResponseDto = {
  id: "pet-1",
  allergies: ["Dander"],
  chronicConditions: ["Asthma"],
  behavioralNotes: null,
};

const unchanged = {
  allergies: ["Dander"],
  chronicConditions: ["Asthma"],
  behavioralNotes: [""],
};

describe("buildBasicsPatch", () => {
  it("sends nothing when no list changed, blank rows and padding included", () => {
    expect(buildBasicsPatch({ ...unchanged, allergies: ["  Dander ", " "] }, pet)).toEqual({});
  });

  it("sends only the lists that changed", () => {
    expect(buildBasicsPatch({ ...unchanged, behavioralNotes: ["Hides from guests"] }, pet)).toEqual(
      { behavioralNotes: ["Hides from guests"] }
    );
  });

  it("clears a list with null once every row is blank", () => {
    expect(buildBasicsPatch({ ...unchanged, chronicConditions: ["", "  "] }, pet)).toEqual({
      chronicConditions: null,
    });
  });
});
