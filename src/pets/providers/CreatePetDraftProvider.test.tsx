/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import i18next from "i18next";

import enCommon from "@/common/locales/en.json";
import { useCreatePetDraft } from "@/pets/hooks/useCreatePetDraft";
import enPets from "@/pets/locales/en.json";

import { CreatePetDraftProvider } from "./CreatePetDraftProvider";

beforeAll(async () => {
  await i18next.use(initReactI18next).init({
    lng: "en",
    resources: { en: { pets: enPets, common: enCommon } },
    interpolation: { escapeValue: false },
  });
});

const mockCreatePet = jest.fn();

jest.mock("@/pets/queries/useCreatePetMutation", () => ({
  useCreatePetMutation: () => ({ mutateAsync: mockCreatePet }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity, retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <CreatePetDraftProvider>{children}</CreatePetDraftProvider>
  </QueryClientProvider>
);

// The form debounces its validation on a timer that would keep the Jest worker alive.
beforeEach(() => jest.useFakeTimers());

afterEach(() => {
  jest.useRealTimers();
  queryClient.clear();
});

describe("CreatePetDraftProvider", () => {
  it("hands every entry point the same draft", () => {
    const { result } = renderHook(() => [useCreatePetDraft(), useCreatePetDraft()], { wrapper });

    act(() => result.current[0].form.setFieldValue("name", "Rex"));

    expect(result.current[1].form.state.values.name).toBe("Rex");
    expect(result.current[1].form).toBe(result.current[0].form);
  });

  it("empties the draft on reset", () => {
    const { result } = renderHook(() => useCreatePetDraft(), { wrapper });
    act(() => result.current.form.setFieldValue("allergies", ["Chicken"]));
    expect(result.current.form.state.isDefaultValue).toBe(false);

    act(() => result.current.form.reset());

    expect(result.current.form.state.isDefaultValue).toBe(true);
    expect(result.current.form.state.values.allergies).toEqual([]);
  });

  it("starts empty again after the provider unmounts, as on sign-out", () => {
    const first = renderHook(() => useCreatePetDraft(), { wrapper });
    act(() => first.result.current.form.setFieldValue("name", "Rex"));
    first.unmount();

    const second = renderHook(() => useCreatePetDraft(), { wrapper });

    expect(second.result.current.form.state.values.name).toBe("");
  });

  it("hands the created pet to the open drawer and empties the draft", async () => {
    mockCreatePet.mockImplementation(() => Promise.resolve({ id: "pet-1" }));
    const onCreated = jest.fn();
    const { result } = renderHook(() => useCreatePetDraft(), { wrapper });
    act(() => {
      result.current.registerOnCreated(onCreated);
      result.current.form.setFieldValue("name", "Rex");
      result.current.form.setFieldValue("species", "Dog");
      result.current.form.setFieldValue("weightKg", "3");
    });

    await act(() => result.current.form.handleSubmit());

    expect(onCreated).toHaveBeenCalledWith({ id: "pet-1" });
    expect(result.current.form.state.values.name).toBe("");
  });
});
