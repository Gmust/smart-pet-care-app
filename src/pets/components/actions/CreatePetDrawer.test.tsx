/// <reference types="jest" />

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AxiosHeaders } from "axios";

import { AnimalSpecies, type PetResponseDto } from "@/api/generated";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// setApiFieldErrors translates through the global instance, not the hook.
jest.mock("i18next", () => ({
  __esModule: true,
  default: { t: (key: string) => mockTranslate(key) },
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardEvents: { addListener: () => ({ remove: () => undefined }) },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/api", () => ({ postApiPets: jest.fn() }));

// The sheet needs the real Reanimated at import time; the steps are what this test is about.
jest.mock("@/shadecn/ui/drawer", () => {
  // No JSX in here: Babel registers named components with an out-of-scope helper, which
  // jest.mock factories reject.
  const React = require("react");
  const { Text, View } = require("react-native");
  const passthrough = (testID: string, Component = View) => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) =>
      React.createElement(Component, { testID }, children);
    Passthrough.displayName = `Mock(${testID})`;
    return Passthrough;
  };
  return {
    Drawer: passthrough("drawer"),
    DrawerContent: passthrough("drawer-content"),
    DrawerHeader: passthrough("drawer-header"),
    DrawerTitle: passthrough("drawer-title", Text),
    DrawerFooter: passthrough("drawer-footer"),
    DrawerScrollView: passthrough("drawer-scroll"),
    DrawerKeyboardDismiss: passthrough("drawer-keyboard-dismiss"),
    useDrawerNativeActivity: () => () => undefined,
    useDrawerSetOpen: () => () => undefined,
    useDrawerClose: () => () => undefined,
    DRAWER_FOOTER_SOFT_FADE_SPACING: 20,
  };
});

import { postApiPets } from "@/api";
import { useCreatePetDraft } from "@/pets/hooks/useCreatePetDraft";
import { CreatePetDraftProvider } from "@/pets/providers/CreatePetDraftProvider";

import { CreatePetDrawer } from "./CreatePetDrawer";

const createdPet: PetResponseDto = { id: "pet-1", name: "Rex" };

const clients: QueryClient[] = [];
let draft: ReturnType<typeof useCreatePetDraft> | undefined;

const DraftProbe = () => {
  const value = useCreatePetDraft();
  useEffect(() => {
    draft = value;
  });
  return null;
};

const tree = (queryClient: QueryClient, onCreated: () => void, setIsOpen = jest.fn()) => (
  <QueryClientProvider client={queryClient}>
    <CreatePetDraftProvider>
      <CreatePetDrawer isOpen setIsOpen={setIsOpen} onCreated={onCreated} />
      <DraftProbe />
    </CreatePetDraftProvider>
  </QueryClientProvider>
);

const newClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });
  clients.push(queryClient);
  return queryClient;
};

const fillStepOne = async () => {
  await act(async () => {
    draft?.form.setFieldValue("name", "Rex");
    draft?.form.setFieldValue("species", AnimalSpecies.Dog);
    draft?.form.setFieldValue("weightKg", "3");
  });
};

describe("CreatePetDrawer", () => {
  // The form debounces its validation on a timer that would keep the Jest worker alive.
  beforeEach(() => {
    jest.useFakeTimers();
    draft = undefined;
    jest.mocked(postApiPets).mockImplementation(() =>
      Promise.resolve({
        data: createdPet,
        status: 201,
        statusText: "Created",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    clients.forEach((client) => client.clear());
    clients.length = 0;
  });

  it("reports the created pet before it closes, as AssistantNewPetPage relies on", async () => {
    const calls: string[] = [];
    render(
      tree(
        newClient(),
        () => calls.push("onCreated"),
        jest.fn(() => calls.push("setIsOpen"))
      )
    );
    await fillStepOne();
    fireEvent.press(screen.getByText("pets:createPetDrawer.next"));

    fireEvent.press(screen.getByText("pets:createPetDrawer.submit"));
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(postApiPets).toHaveBeenCalled();
    expect(calls).toEqual(["onCreated", "setIsOpen"]);
  });

  it("stays on step 2 when the caller re-renders with a new onCreated", async () => {
    const queryClient = newClient();
    const { rerender } = render(tree(queryClient, () => undefined));
    await fillStepOne();
    fireEvent.press(screen.getByText("pets:createPetDrawer.next"));
    expect(screen.getByText("pets:createPetDrawer.healthTitle")).toBeTruthy();

    rerender(tree(queryClient, () => undefined));

    expect(screen.getByText("pets:createPetDrawer.healthTitle")).toBeTruthy();
    expect(screen.queryByText("pets:createPetDrawer.title")).toBeNull();
  });
});
