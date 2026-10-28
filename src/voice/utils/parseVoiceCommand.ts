import type { PetResponseDto } from "@/api/generated";

import type { VoiceParseResult } from "../types";

type VoicePet = Pick<PetResponseDto, "id" | "name" | "species">;

const ONES = new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
]);

const TENS = new Map([
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
]);

const UNIT = "(kg|kgs|kilos?|kilograms?|kilogrammes?|lbs?|pounds?)";
const WEIGHT_WITH_UNIT = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${UNIT}\\b`);
const UNIT_WORD = new RegExp(`\\b${UNIT}\\b`);
const BARE_NUMBER = /\d+(?:\.\d+)?/;
const WEIGHT_KEYWORD = /\bweigh(?:s|ed|ing|t)?\b/;
const NOTE_KEYWORD = /\b(?:notes?|jot down|write down)\b/i;
const KG_PER_LB = 0.45359237;

const SPECIES_WORDS: Record<string, string[]> = {
  Dog: ["dog", "doggy", "puppy"],
  Cat: ["cat", "kitty", "kitten"],
  Rabbit: ["rabbit", "bunny"],
  Hamster: ["hamster"],
  GuineaPig: ["guinea pig"],
  Bird: ["bird", "parrot"],
  Fish: ["fish"],
  Turtle: ["turtle", "tortoise"],
};

// Words of the command itself. One edit away from a pet's name ("kilo" vs "Milo") they would
// otherwise pass the fuzzy match below and pick a pet nobody named.
const COMMAND_WORDS = new Set([
  "kg",
  "kgs",
  "kilo",
  "kilos",
  "kilogram",
  "kilograms",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "weigh",
  "weighs",
  "weighed",
  "weight",
  "note",
  "notes",
  "log",
  "add",
  "make",
  "write",
  "down",
  "jot",
  "record",
  "set",
  "new",
  "for",
  "that",
  "this",
  "the",
  "and",
  "with",
  "about",
  "saying",
  "says",
  "today",
  "please",
  "his",
  "her",
  "him",
  "she",
  "he",
  "was",
  "has",
  "had",
  "my",
  "our",
]);

const SEPARATORS = "[\\s,:;.!?\\-–—]";

// Splits on whitespace and punctuation rather than \b, which only knows ASCII letters: a name
// like "Zoë" has no word boundary after its last letter. A possessive "'s" is dropped.
const toWords = (text: string) =>
  text
    .toLowerCase()
    .split(/[\s,.!?;:"()[\]]+/)
    .filter(Boolean)
    .map((word) => word.replace(/['’]s$/, ""));

/**
 * Turns a transcript into an action for the app. Rule-based on purpose: a small on-device model
 * can replace it later by returning the same `VoiceParseResult`.
 *
 * `petId` is null when the phrase names no pet and the user has more than one; the caller asks.
 */
export const parseVoiceCommand = (transcript: string, pets: VoicePet[]): VoiceParseResult => {
  const named = pets.flatMap((pet) =>
    pet.id && pet.name?.trim() ? [{ id: pet.id, name: pet.name.trim(), species: pet.species }] : []
  );

  // Same length as the transcript, so an index found here is an index there too.
  const lower = transcript
    .toLowerCase()
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/[^a-z0-9\s.'’-]/g, " ")
    .replace(/\.(?!\d)/g, " ");

  // Speech engines usually write numbers as digits, but not always: "twelve and a half kilos"
  // becomes "12.5 kilos" here.
  const tokens = lower.replace(/-/g, " ").split(/\s+/).filter(Boolean);
  const normalizedTokens: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i];
    let value: number | null = null;
    if (/^\d+(\.\d+)?$/.test(token)) {
      value = Number(token);
      i += 1;
    } else if (TENS.has(token)) {
      value = TENS.get(token) ?? 0;
      i += 1;
      const unit = ONES.get(tokens[i] ?? "");
      if (unit !== undefined && unit < 10) {
        value += unit;
        i += 1;
      }
    } else if (ONES.has(token)) {
      value = ONES.get(token) ?? 0;
      i += 1;
    }

    if (value === null) {
      normalizedTokens.push(token);
      i += 1;
      continue;
    }

    const firstDecimal = ONES.get(tokens[i + 1] ?? "");
    if (tokens[i] === "point" && firstDecimal !== undefined && firstDecimal < 10) {
      i += 1;
      let decimals = "";
      for (let digit = ONES.get(tokens[i] ?? ""); digit !== undefined && digit < 10; ) {
        decimals += String(digit);
        i += 1;
        digit = ONES.get(tokens[i] ?? "");
      }
      value = Number(`${value}.${decimals}`);
    } else if (tokens[i] === "and" && tokens[i + 1] === "a" && tokens[i + 2] === "half") {
      value += 0.5;
      i += 3;
    } else if (tokens[i] === "and" && tokens[i + 1] === "half") {
      value += 0.5;
      i += 2;
    }
    normalizedTokens.push(String(value));
  }
  const normalized = normalizedTokens.join(" ");

  const withUnit = WEIGHT_WITH_UNIT.exec(normalized);
  const noteIndex = lower.search(NOTE_KEYWORD);
  const weightIndexes = [lower.search(WEIGHT_KEYWORD), withUnit ? lower.search(UNIT_WORD) : -1];
  const weightIndex = Math.min(...weightIndexes.map((index) => (index < 0 ? Infinity : index)));

  // Whichever keyword comes first decides: "add a note that Milo weighs 12 kg" is a note.
  const action =
    noteIndex >= 0 && noteIndex < weightIndex
      ? "addNote"
      : weightIndex !== Infinity
        ? "logWeight"
        : null;
  if (!action) return { kind: "unrecognized" };

  // Pet: an exact name first, earliest mention winning ("a note for Milo that Luna bit him" is
  // about Milo). Then one name a single letter off ("Mylo"), then a species only one pet has
  // ("my cat"), then the only pet there is.
  const words = toWords(transcript);
  const exact = named
    .map((pet) => {
      const nameWords = toWords(pet.name);
      const index = words.findIndex((_, start) =>
        nameWords.every((nameWord, offset) => {
          const word = words[start + offset];
          const isLast = offset === nameWords.length - 1;
          // Recognizers often drop the apostrophe: "Milos weight".
          return word === nameWord || (isLast && word === `${nameWord}s`);
        })
      );
      return { pet, index };
    })
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);

  const fuzzy = named.filter((pet) => {
    const nameWords = toWords(pet.name);
    if (nameWords.length !== 1 || nameWords[0].length < 4) return false;
    return words.some((word) => !COMMAND_WORDS.has(word) && isOneEditAway(word, nameWords[0]));
  });

  const spokenText = ` ${words.join(" ")} `;
  const bySpecies = Object.entries(SPECIES_WORDS).flatMap(([species, speciesWords]) =>
    speciesWords.some((word) => spokenText.includes(` ${word} `))
      ? named.filter((pet) => pet.species === species)
      : []
  );

  const pet =
    exact[0]?.pet ??
    (fuzzy.length === 1 ? fuzzy[0] : undefined) ??
    (bySpecies.length === 1 ? bySpecies[0] : undefined) ??
    (named.length === 1 ? named[0] : undefined);
  const petId = pet?.id ?? null;

  if (action === "logWeight") {
    const bare = withUnit ? null : BARE_NUMBER.exec(normalized);
    const amount = withUnit ? Number(withUnit[1]) : bare ? Number(bare[0]) : null;
    const isPounds = !!withUnit && /^(lb|pound)/.test(withUnit[2]);
    // No unit means kilograms: the weight form only takes kilograms.
    const kg = amount === null ? null : isPounds ? amount * KG_PER_LB : amount;
    const weightKg = kg !== null && kg > 0 ? String(Number(kg.toFixed(2))) : "";
    return { kind: "command", command: { action, petId, weightKg } };
  }

  // The note body is what follows the keyword, in the user's own casing, minus the parts that
  // address it: "Add a note for Milo: he skipped breakfast" → "He skipped breakfast".
  const keyword = NOTE_KEYWORD.exec(transcript);
  let rest = keyword ? transcript.slice(keyword.index + keyword[0].length) : "";
  rest = rest.replace(new RegExp(`^${SEPARATORS}*(?:for|about|on|to)\\s+`, "i"), "");
  if (pet) {
    const escapedName = pet.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rest = rest.replace(new RegExp(`^${escapedName}(?:['’]s)?(?=$|${SEPARATORS})`, "i"), "");
  }
  rest = rest
    .replace(new RegExp(`^${SEPARATORS}*(?:(?:that|saying|says)(?=\\s|$))?${SEPARATORS}*`, "i"), "")
    .trim();
  const content = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : "";

  return { kind: "command", command: { action, petId, content } };
};

const isOneEditAway = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1 || a === b) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current.push(Math.min(previous[j] + 1, current[j - 1] + 1, substitution));
    }
    previous = current;
  }
  return previous[b.length] === 1;
};
