/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import type { PetResponseDto } from "@/api";
import {
  ClassifierWellnessBand,
  ClassifierWellnessReasonCode,
  ClassifierWellnessScoreStatus,
  type WellnessResponseDto,
} from "@/api/generated";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

// jest.mock factories may only reach variables whose names begin with "mock".
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Native modules must be mocked explicitly — an Expo auto-mock can render
// nothing at all, which would make the queries below pass vacuously.
// No JSX inside a jest.mock factory: babel's named-component helper is
// out of scope there and the factory is rejected.
jest.mock("expo-blur", () => {
  const react = require("react");
  const { View } = require("react-native");
  return {
    BlurView: ({ children }: { children?: unknown }) => react.createElement(View, null, children),
  };
});
jest.mock("expo-image", () => {
  const react = require("react");
  const { View } = require("react-native");
  return { Image: () => react.createElement(View, null) };
});

const mockUseWellnessQuery = jest.fn();
jest.mock("@/wellness/queries/useWellnessQuery", () => ({
  useWellnessQuery: () => mockUseWellnessQuery(),
}));

import { HealthPetCard } from "./HealthPetCard";

const PET_ID = "8f1a4f0e-4b4a-4d0a-9d0e-2f1b7c3a5d61";

const pet: PetResponseDto = {
  id: PET_ID,
  name: "Rex",
  photoUrl: null,
};

const wellnessWith = (overrides: Partial<WellnessResponseDto>): WellnessResponseDto => ({
  wellnessScore: 78,
  band: ClassifierWellnessBand.GOOD,
  scoreStatus: ClassifierWellnessScoreStatus.COMPLETE,
  states: {
    activity: ClassifierWellnessReasonCode.ACTIVITY_TARGET_MET,
    sleep: ClassifierWellnessReasonCode.SLEEP_WITHIN_RANGE,
    diet: ClassifierWellnessReasonCode.DIET_TRACKING_STRONG,
    symptoms: ClassifierWellnessReasonCode.SYMPTOMS_NOT_REPORTED,
    preventiveCare: ClassifierWellnessReasonCode.PREVENTIVE_CARE_CURRENT,
    baseline: ClassifierWellnessReasonCode.BASELINE_STABLE,
  },
  narrative: "",
  recommendations: [],
  reminderSuggestions: [],
  disclaimer: "",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWellnessQuery.mockReturnValue({ data: undefined });
});

describe("HealthPetCard", () => {
  it("renders a score of zero as a real score, not as missing", () => {
    // The guard is `score !== null`. Written as `score &&` — an easy edit —
    // the worst-off pet in the app silently loses its "/100" and reads as
    // having no score at all.
    mockUseWellnessQuery.mockReturnValue({
      data: wellnessWith({ wellnessScore: 0, band: ClassifierWellnessBand.CRITICAL }),
    });

    const { getByText, queryByText } = render(<HealthPetCard pet={pet} />);

    expect(getByText("0")).toBeTruthy();
    expect(getByText("wellness:score.outOf")).toBeTruthy();
    expect(queryByText("wellness:score.unavailable")).toBeNull();
  });

  it("shows the placeholder and no /100 when there is no score", () => {
    mockUseWellnessQuery.mockReturnValue({
      data: wellnessWith({ wellnessScore: null, band: null }),
    });

    const { getByText, queryByText } = render(<HealthPetCard pet={pet} />);

    expect(getByText("wellness:score.unavailable")).toBeTruthy();
    expect(queryByText("wellness:score.outOf")).toBeNull();
    expect(getByText("wellness:band.unknown")).toBeTruthy();
  });

  it("hides the signal row until wellness data arrives", () => {
    const { queryByText, rerender } = render(<HealthPetCard pet={pet} />);

    expect(queryByText("wellness:states.labels.activity")).toBeNull();

    mockUseWellnessQuery.mockReturnValue({ data: wellnessWith({}) });
    rerender(<HealthPetCard pet={pet} />);

    expect(queryByText("wellness:states.labels.activity")).toBeTruthy();
  });

  it("opens the wellness screen from the score block, not the pet profile", () => {
    mockUseWellnessQuery.mockReturnValue({ data: wellnessWith({}) });

    const { getByLabelText } = render(<HealthPetCard pet={pet} />);

    fireEvent.press(getByLabelText("wellness:score.label"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(tabs)/pets/wellness",
      params: { petId: PET_ID },
    });
  });

  it("lets screen readers open the wellness screen from the card itself", () => {
    // iOS groups the accessible card, so VoiceOver never reaches the nested
    // score button — the custom action is the only screen-reader path in.
    mockUseWellnessQuery.mockReturnValue({ data: wellnessWith({}) });

    const { getByLabelText } = render(<HealthPetCard pet={pet} />);

    fireEvent(getByLabelText("healthPetCard.title"), "accessibilityAction", {
      nativeEvent: { actionName: "openWellness" },
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(tabs)/pets/wellness",
      params: { petId: PET_ID },
    });
  });
});
