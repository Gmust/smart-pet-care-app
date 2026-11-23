/// <reference types="jest" />

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: 1,
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

// The real switch animates with Reanimated, which the Jest stub does not cover.
jest.mock("@/shadecn/ui/switch", () => {
  const { Pressable } = require("react-native");
  const React = require("react");

  return {
    Switch: (props: {
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      accessibilityLabel?: string;
    }) =>
      React.createElement(Pressable, {
        accessibilityRole: "switch",
        accessibilityLabel: props.accessibilityLabel,
        accessibilityState: { checked: props.checked },
        onPress: () => props.onCheckedChange(!props.checked),
      }),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

import { PetListModeProvider } from "../providers/PetListModeProvider";

import PetListSettingsPage from "./PetListSettingsPage";

const renderPage = async (stored: string | null) => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(stored);

  render(
    <PetListModeProvider>
      <PetListSettingsPage />
    </PetListModeProvider>
  );

  await act(async () => {});
};

const storedMode = () => jest.mocked(SecureStore.setItemAsync).mock.calls.at(-1)?.[1];

const isSelected = (label: string) =>
  screen.getByRole("radio", { name: label }).props.accessibilityState.selected;

describe("PetListSettingsPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts on Single pet when nothing is stored", async () => {
    await renderPage(null);

    expect(isSelected("pets:petListSettings.singleLabel")).toBe(true);
    expect(isSelected("pets:petListSettings.listLabel")).toBe(false);
  });

  it("shows the stored list mode", async () => {
    await renderPage("on");

    await waitFor(() => expect(isSelected("pets:petListSettings.listLabel")).toBe(true));
  });

  it("applies the switch at once and saves it, with the preview following", async () => {
    await renderPage(null);

    fireEvent.press(screen.getByLabelText("pets:petListSettings.toggleTitle"));

    await waitFor(() => expect(isSelected("pets:petListSettings.listLabel")).toBe(true));
    expect(storedMode()).toBe("on");

    fireEvent.press(screen.getByLabelText("pets:petListSettings.toggleTitle"));

    await waitFor(() => expect(isSelected("pets:petListSettings.singleLabel")).toBe(true));
    expect(storedMode()).toBe("off");
  });

  it("switches mode from a preview tile", async () => {
    await renderPage(null);

    fireEvent.press(screen.getByRole("radio", { name: "pets:petListSettings.listLabel" }));

    await waitFor(() => expect(isSelected("pets:petListSettings.listLabel")).toBe(true));
    expect(storedMode()).toBe("on");
  });
});
