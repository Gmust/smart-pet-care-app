/// <reference types="jest" />

import type { ReactNode } from "react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

let mockSearchParams: Record<string, string> = {};
const mockRedirect = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockSearchParams,
  useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: mockCanGoBack }),
  // A render-visible stand-in so a test can assert whether a redirect was
  // rendered without a real navigation container.
  Redirect: (props: { href: unknown }) => {
    mockRedirect(props.href);
    return null;
  },
}));

jest.mock("@/common/hooks/useIsOnline", () => ({
  useIsOnline: () => true,
}));

jest.mock("@/api", () => ({
  getApiPetsId: jest.fn(),
  getApiPetsPetIdNotes: jest.fn(),
}));

import { getApiPetsId, getApiPetsPetIdNotes } from "@/api";

import SingleNotePage from "./SingleNotePage";

const petMock = jest.mocked(getApiPetsId);
const notesMock = jest.mocked(getApiPetsPetIdNotes);

const PET_ID = "11111111-1111-4111-8111-111111111111";
const NOTE_ID = "22222222-2222-4222-8222-222222222222";

const axiosOk = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const clients: QueryClient[] = [];

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  clients.push(queryClient);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<SingleNotePage />, { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack.mockReturnValue(true);
  mockSearchParams = { petId: PET_ID, noteId: NOTE_ID };
  petMock.mockResolvedValue(axiosOk({ id: PET_ID, name: "Miso" }));
});

afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("SingleNotePage", () => {
  it("shows an error state instead of redirecting when the notes query fails", async () => {
    notesMock.mockImplementation(() => Promise.reject(new Error("network down")));

    const { findByText } = renderPage();

    await findByText("errors.somethingWentWrong");

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("shows an error state instead of redirecting when offline with no cached notes", async () => {
    // Default networkMode "online": query client never calls queryFn while
    // offline, it just sits paused — isError stays false, unlike a real
    // rejection. This is the case the "not found" redirect used to miss.
    onlineManager.setOnline(false);

    const { findByText } = renderPage();

    await findByText("errors.somethingWentWrong");

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(notesMock).not.toHaveBeenCalled();
  });

  it("gives the error state a way back, since the stack draws no header", async () => {
    notesMock.mockImplementation(() => Promise.reject(new Error("network down")));

    const { findByLabelText } = renderPage();
    fireEvent.press(await findByLabelText("actions.back"));

    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("leaves to the pet list when there is no history, as after a deep link", async () => {
    mockCanGoBack.mockReturnValue(false);
    notesMock.mockImplementation(() => Promise.reject(new Error("network down")));

    const { findByLabelText } = renderPage();
    fireEvent.press(await findByLabelText("actions.back"));

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/pets");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("redirects to the pet list on a 404, where no retry could ever succeed", async () => {
    notesMock.mockImplementation(() =>
      Promise.reject(
        new AxiosError("Not Found", "ERR_BAD_REQUEST", undefined, undefined, {
          data: { code: "pet_not_found" },
          status: 404,
          statusText: "Not Found",
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
        })
      )
    );

    const { queryByText } = renderPage();

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith("/(tabs)/pets"));

    expect(queryByText("errors.somethingWentWrong")).toBeNull();
  });

  it("redirects to the pet profile when the note truly doesn't exist", async () => {
    notesMock.mockResolvedValue(axiosOk([]));

    renderPage();

    await waitFor(() =>
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/(tabs)/pets/pet-profile" })
      )
    );
  });
});
