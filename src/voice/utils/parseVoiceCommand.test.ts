/// <reference types="jest" />

import type { PetResponseDto } from "@/api/generated";

import { parseVoiceCommand } from "./parseVoiceCommand";

const MILO = { id: "pet-milo", name: "Milo", species: "Dog" } as const satisfies PetResponseDto;
const LUNA = { id: "pet-luna", name: "Luna", species: "Cat" } as const satisfies PetResponseDto;
const MR_BEANS = {
  id: "pet-beans",
  name: "Mr Beans",
  species: "Rabbit",
} as const satisfies PetResponseDto;
const PETS = [MILO, LUNA];

describe("parseVoiceCommand — logging a weight", () => {
  it.each([
    ["Milo weighs 12 kg", "12"],
    ["Log weight 4.5 kilos for Milo", "4.5"],
    ["Milo's weight is 12,5 kilograms", "12.5"],
    ["milo weighs twelve and a half kilos", "12.5"],
    ["Milo weighs four point two kilos", "4.2"],
    ["Milo weighs twenty-three kilos", "23"],
    ["Milo weighs 12", "12"],
  ])("reads %j as %s kg", (phrase, weightKg) => {
    expect(parseVoiceCommand(phrase, PETS)).toEqual({
      kind: "command",
      command: { action: "logWeight", petId: MILO.id, weightKg },
    });
  });

  it("converts pounds to kilograms", () => {
    expect(parseVoiceCommand("Set Milo's weight to 22 pounds", PETS)).toEqual({
      kind: "command",
      command: { action: "logWeight", petId: MILO.id, weightKg: "9.98" },
    });
  });

  it("treats a number with a weight unit as a weight even without the word", () => {
    expect(parseVoiceCommand("Record 3.1 kg for Luna", PETS)).toEqual({
      kind: "command",
      command: { action: "logWeight", petId: LUNA.id, weightKg: "3.1" },
    });
  });

  it("is a weight when the weight comes before a note keyword", () => {
    expect(parseVoiceCommand("Milo weighs 12 kg, write down he ate a lot", PETS)).toEqual({
      kind: "command",
      command: { action: "logWeight", petId: MILO.id, weightKg: "12" },
    });
  });

  it("leaves the weight empty when no number was said", () => {
    expect(parseVoiceCommand("Log Milo's weight", PETS)).toEqual({
      kind: "command",
      command: { action: "logWeight", petId: MILO.id, weightKg: "" },
    });
  });
});

describe("parseVoiceCommand — finding the pet", () => {
  const petIdFor = (phrase: string, pets: PetResponseDto[] = PETS) => {
    const result = parseVoiceCommand(phrase, pets);
    return result.kind === "command" ? result.command.petId : undefined;
  };

  it("matches a name regardless of case and a dropped apostrophe", () => {
    expect(petIdFor("LUNA weighs 4 kg")).toBe(LUNA.id);
    expect(petIdFor("Lunas weight is 4 kg")).toBe(LUNA.id);
  });

  it("matches a multi-word name", () => {
    expect(petIdFor("Mr Beans weighs 2 kg", [MILO, MR_BEANS])).toBe(MR_BEANS.id);
  });

  it("takes the first pet mentioned", () => {
    expect(petIdFor("Add a note for Milo that Luna bit him")).toBe(MILO.id);
  });

  it("accepts a name the recognizer got one letter wrong", () => {
    expect(petIdFor("Mylo weighs 10 kg")).toBe(MILO.id);
  });

  it("never reads a unit as a misheard name", () => {
    // "kilo" is one letter from "Milo".
    expect(petIdFor("Log 3 kilo")).toBeNull();
  });

  it("uses the species when only one pet has it", () => {
    expect(petIdFor("My cat weighs 4 kg")).toBe(LUNA.id);
  });

  it("uses the only pet when none is named", () => {
    expect(petIdFor("Log 12 kilos", [MILO])).toBe(MILO.id);
  });

  it("asks (null) when several pets could be meant", () => {
    expect(petIdFor("Log 12 kilos")).toBeNull();
  });

  it("ignores pets without an id or a name", () => {
    expect(petIdFor("Log 12 kilos", [MILO, { id: "pet-x" }, { name: "Ghost" }])).toBe(MILO.id);
  });
});

describe("parseVoiceCommand — adding a note", () => {
  it.each([
    ["Add a note for Milo: he didn't eat breakfast", MILO.id, "He didn't eat breakfast"],
    ["Note for Luna saying she loves the park", LUNA.id, "She loves the park"],
    ["Make a note that Luna was sick today", LUNA.id, "Luna was sick today"],
    ["Write down that Milo had his vaccine", MILO.id, "Milo had his vaccine"],
    ["Milo note, limping on the left paw", MILO.id, "Limping on the left paw"],
    ["Add a note for Milo", MILO.id, ""],
  ])("reads %j", (phrase, petId, content) => {
    expect(parseVoiceCommand(phrase, PETS)).toEqual({
      kind: "command",
      command: { action: "addNote", petId, content },
    });
  });

  it("is a note when the note keyword comes before a weight", () => {
    expect(parseVoiceCommand("Add a note that Milo weighs 12 kg", PETS)).toEqual({
      kind: "command",
      command: { action: "addNote", petId: MILO.id, content: "Milo weighs 12 kg" },
    });
  });
});

describe("parseVoiceCommand — anything else", () => {
  it.each(["", "What's the weather like", "Milo is a good boy"])(
    "does not guess an action for %j",
    (phrase) => {
      expect(parseVoiceCommand(phrase, PETS)).toEqual({ kind: "unrecognized" });
    }
  );
});
