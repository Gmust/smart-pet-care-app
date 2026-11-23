/// <reference types="jest" />

import type { ReactNode } from "react";
import { notifyManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";

const mockTranslate = (key: string, options?: object) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: 1,
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock("@/api", () => ({ getApiPets: jest.fn() }));

// The real sheet needs Reanimated at import time; this one renders its children while open and
// offers a button that stands in for a swipe or a tap on the backdrop.
jest.mock("@/shadecn/ui/drawer", () => {
  const { Pressable, Text, View } = require("react-native");
  const React = require("react");
  const passthrough = (Component: unknown) => {
    const Passthrough = (props: { children?: ReactNode }) =>
      React.createElement(Component, null, props.children);
    return Passthrough;
  };

  return {
    // Like the real sheet, reports a dismiss whenever it closes, even when the prop closed it.
    Drawer: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children: ReactNode;
    }) => {
      React.useEffect(() => {
        if (!open) onOpenChange(false);
      }, [open, onOpenChange]);

      return open
        ? React.createElement(
            View,
            { testID: "drawer" },
            children,
            React.createElement(Pressable, {
              testID: "drawer-dismiss",
              onPress: () => onOpenChange(false),
            })
          )
        : null;
    },
    DrawerContent: passthrough(View),
    DrawerHeader: passthrough(View),
    DrawerFooter: passthrough(View),
    DrawerTitle: passthrough(Text),
    DrawerDescription: passthrough(Text),
  };
});

import { getApiPets } from "@/api";

import { PetListModeProvider } from "../providers/PetListModeProvider";

import { PetListSuggestionDrawer } from "./PetListSuggestionDrawer";

const axiosOk = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const clients: QueryClient[] = [];

const renderDrawer = async ({ petCount, stored }: { petCount: number; stored: string | null }) => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(stored);
  jest
    .mocked(getApiPets)
    .mockResolvedValue(
      axiosOk(Array.from({ length: petCount }, (_, index) => ({ id: `pet-${index}` }))) as never
    );

  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false, staleTime: Infinity } },
  });
  clients.push(queryClient);

  render(
    <QueryClientProvider client={queryClient}>
      <PetListModeProvider>
        <PetListSuggestionDrawer />
      </PetListModeProvider>
    </QueryClientProvider>
  );

  await waitFor(() => expect(getApiPets).toHaveBeenCalled());
  await act(async () => {});
};

const storedMode = () => jest.mocked(SecureStore.setItemAsync).mock.calls.at(-1)?.[1];

describe("PetListSuggestionDrawer", () => {
  // React Query batches notifications on a timer, which lands outside act().
  beforeAll(() => notifyManager.setScheduler((callback) => callback()));

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    clients.forEach((client) => client.clear());
    clients.length = 0;
  });

  it("asks once the user has five pets and never chose a mode", async () => {
    await renderDrawer({ petCount: 5, stored: null });

    expect(screen.getByTestId("drawer")).toBeTruthy();
    expect(screen.getByText(/petListSuggestion.description.*"petCount":5/)).toBeTruthy();
  });

  it("stays closed with four pets", async () => {
    await renderDrawer({ petCount: 4, stored: null });

    expect(screen.queryByTestId("drawer")).toBeNull();
  });

  it.each(["on", "off"])("stays closed once %s is stored on this device", async (stored) => {
    await renderDrawer({ petCount: 7, stored });

    expect(screen.queryByTestId("drawer")).toBeNull();
  });

  it("turns the list on and closes for Switch", async () => {
    await renderDrawer({ petCount: 5, stored: null });

    fireEvent.press(screen.getByText("pets:petListSuggestion.confirm"));

    await waitFor(() => expect(screen.queryByTestId("drawer")).toBeNull());
    expect(storedMode()).toBe("on");
  });

  it("stores off for Don’t show again, so it is not asked again", async () => {
    await renderDrawer({ petCount: 5, stored: null });

    fireEvent.press(screen.getByText("pets:petListSuggestion.dismiss"));

    await waitFor(() => expect(screen.queryByTestId("drawer")).toBeNull());
    expect(storedMode()).toBe("off");
  });

  it("stores nothing when the sheet is closed without an answer", async () => {
    await renderDrawer({ petCount: 5, stored: null });

    fireEvent.press(screen.getByTestId("drawer-dismiss"));

    await waitFor(() => expect(screen.queryByTestId("drawer")).toBeNull());
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("stays closed after the screen remounts once it was closed without an answer", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    jest
      .mocked(getApiPets)
      .mockResolvedValue(
        axiosOk(Array.from({ length: 5 }, (_, index) => ({ id: `pet-${index}` }))) as never
      );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false, staleTime: Infinity } },
    });
    clients.push(queryClient);
    const tree = (key: string) => (
      <QueryClientProvider client={queryClient}>
        <PetListModeProvider>
          <PetListSuggestionDrawer key={key} />
        </PetListModeProvider>
      </QueryClientProvider>
    );

    const { rerender } = render(tree("first"));
    await waitFor(() => expect(screen.getByTestId("drawer")).toBeTruthy());
    fireEvent.press(screen.getByTestId("drawer-dismiss"));
    await waitFor(() => expect(screen.queryByTestId("drawer")).toBeNull());

    rerender(tree("second"));
    await act(async () => {});

    expect(screen.queryByTestId("drawer")).toBeNull();
  });

  it("does not trust an invalidated count until the pets have been refetched", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    let resolvePets: (value: unknown) => void = () => {};
    jest
      .mocked(getApiPets)
      .mockImplementation(() => new Promise((resolve) => (resolvePets = resolve)) as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false, staleTime: Infinity } },
    });
    clients.push(queryClient);
    queryClient.setQueryData(
      ["pets"],
      Array.from({ length: 5 }, (_, index) => ({ id: `pet-${index}` }))
    );
    queryClient.invalidateQueries({ queryKey: ["pets"] });

    render(
      <QueryClientProvider client={queryClient}>
        <PetListModeProvider>
          <PetListSuggestionDrawer />
        </PetListModeProvider>
      </QueryClientProvider>
    );
    await act(async () => {});
    expect(screen.queryByTestId("drawer")).toBeNull();

    await act(async () => {
      resolvePets(axiosOk(Array.from({ length: 4 }, (_, index) => ({ id: `pet-${index}` }))));
    });

    expect(screen.queryByTestId("drawer")).toBeNull();
  });

  it("still asks when the pets grow to five after a start with four", async () => {
    await renderDrawer({ petCount: 4, stored: null });
    expect(screen.queryByTestId("drawer")).toBeNull();

    await act(async () => {
      clients[0].setQueryData(
        ["pets"],
        Array.from({ length: 5 }, (_, index) => ({ id: `pet-${index}` }))
      );
    });

    expect(screen.getByTestId("drawer")).toBeTruthy();
  });
});
