import { assistantChatResponseSchema } from "../schemas/assistant.schema";

const disclaimer = "General information only—not a diagnosis or substitute for veterinary care.";

const general = assistantChatResponseSchema.parse({
  messageId: "fixture-general",
  conversationId: "fixture-conversation",
  mode: "general",
  answer:
    "A balanced diet and consistent training routines go a long way for most pets. Keep meals portioned to their size and reinforce good behavior with positive rewards.",
  prediction: null,
  relatedTopics: ["Choosing the right food", "Basic obedience training", "Routine wellness care"],
  needsClarification: false,
  disclaimer,
});

const monitor = assistantChatResponseSchema.parse({
  messageId: "fixture-monitor",
  conversationId: "fixture-conversation",
  mode: "health",
  answer:
    "This sounds appropriate for routine veterinary follow-up. Keep an eye on your pet between now and their next checkup.",
  prediction: {
    predictedCondition: "Routine wellness variation",
    confidence: 0.78,
    topK: [
      { condition: "Routine wellness variation", confidence: 0.78 },
      { condition: "Seasonal shedding", confidence: 0.12 },
    ],
    urgency: "MONITOR",
    specialist: "general-practice",
    diseaseCategory: "wellness",
    homeAdvice: [
      "Monitor your pet and note any changes.",
      "Discuss this at the next routine appointment.",
    ],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer,
});

const consultSoon = assistantChatResponseSchema.parse({
  messageId: "fixture-consult-soon",
  conversationId: "fixture-conversation",
  mode: "health",
  answer:
    "Persistent itching and appetite changes are worth a veterinary review soon, though this is not an emergency.",
  prediction: {
    predictedCondition: "Allergic dermatitis",
    confidence: 0.84,
    topK: [
      { condition: "Allergic dermatitis", confidence: 0.84 },
      { condition: "Food sensitivity", confidence: 0.1 },
    ],
    urgency: "CONSULT_SOON",
    specialist: "dermatology",
    diseaseCategory: "skin-and-coat",
    homeAdvice: [
      "Contact your veterinary clinic for advice and an appointment.",
      "Avoid new foods or treats until reviewed.",
    ],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer,
});

const urgent = assistantChatResponseSchema.parse({
  messageId: "fixture-urgent",
  conversationId: "fixture-conversation",
  mode: "health",
  answer:
    "Limping paired with vomiting or lethargy should be evaluated by a veterinarian urgently, ideally today.",
  prediction: {
    predictedCondition: "Acute musculoskeletal injury",
    confidence: 0.81,
    topK: [
      { condition: "Acute musculoskeletal injury", confidence: 0.81 },
      { condition: "Gastrointestinal upset", confidence: 0.09 },
    ],
    urgency: "URGENT",
    specialist: "orthopedics",
    diseaseCategory: "musculoskeletal",
    homeAdvice: [
      "Limit activity and avoid stairs or jumping.",
      "Seek an urgent veterinary appointment today.",
    ],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer,
});

const needsClarification = assistantChatResponseSchema.parse({
  messageId: "fixture-clarification",
  conversationId: "fixture-conversation",
  mode: "health",
  answer: "Can you tell me how long this has been happening and whether it comes and goes?",
  prediction: {
    predictedCondition: "Possible mild gastrointestinal upset",
    confidence: 0.55,
    topK: [
      { condition: "Possible mild gastrointestinal upset", confidence: 0.55 },
      { condition: "Dietary indiscretion", confidence: 0.2 },
    ],
    urgency: "MONITOR",
    specialist: "general-practice",
    diseaseCategory: "digestive",
    homeAdvice: ["Track symptoms and timing to share with a veterinarian."],
  },
  relatedTopics: [],
  needsClarification: true,
  disclaimer,
});

export const emergencyResponse = assistantChatResponseSchema.parse({
  messageId: "fixture-emergency",
  conversationId: "fixture-conversation",
  mode: "emergency",
  answer:
    "Contact the nearest emergency veterinary service immediately. Do not wait for another assistant response.",
  prediction: {
    predictedCondition: "Potential emergency",
    confidence: 1,
    topK: [{ condition: "Potential emergency", confidence: 1 }],
    urgency: "EMERGENCY",
    specialist: "emergency-critical-care",
    diseaseCategory: "emergency",
    homeAdvice: [
      "Go to the nearest emergency veterinary clinic now.",
      "Do not attempt home treatment.",
    ],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer,
});

export const genericHealthResponse = assistantChatResponseSchema.parse({
  messageId: "fixture-generic",
  conversationId: "fixture-conversation",
  mode: "health",
  answer:
    "There is not enough information to assess this safely. A veterinary professional should examine your pet.",
  prediction: {
    predictedCondition: "Undetermined",
    confidence: 0.5,
    topK: [{ condition: "Undetermined", confidence: 0.5 }],
    urgency: "CONSULT_SOON",
    specialist: "general-practice",
    diseaseCategory: "general",
    homeAdvice: ["Contact a veterinary professional who can examine your pet."],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer,
});

export const assistantFixtures = [
  { keywords: ["food", "training", "general care", "diet"], response: general },
  { keywords: ["checkup", "routine", "vaccination"], response: monitor },
  { keywords: ["itch", "scratching", "appetite"], response: consultSoon },
  { keywords: ["limping", "vomiting", "lethargic"], response: urgent },
  { keywords: ["not sure", "sometimes", "comes and goes"], response: needsClarification },
] as const;

export const emergencyIndicators = [
  "cannot breathe",
  "can't breathe",
  "not breathing",
  "unconscious",
  "seizure",
  "severe bleeding",
  "poison",
] as const;

export const serviceFixtureTriggers = {
  failure: "fixture:failure",
  malformed: "fixture:malformed",
  emergency: "fixture:emergency",
} as const;
