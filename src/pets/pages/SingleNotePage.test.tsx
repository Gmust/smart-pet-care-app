/// <reference types="jest" />

import type { ReactNode } from "react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react-native";
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

jest.mock("@/api", () => ({
  getApiPetsId: jest.fn(),
  getApiPetsPetIdNotes: jest.fn(),
  patchApiPetsPetIdNotesNoteId: jest.fn(),
}));

import { getApiPetsId, getApiPetsPetIdNotes, patchApiPetsPetIdNotesNoteId } from "@/api";
import { notesQueryKeys } from "@/pets/queries/notes/notesQueryKeys";
import { useUpdateNoteMutation } from "@/pets/queries/notes/useUpdateNoteMutation";

import SingleNotePage from "./SingleNotePage";

const petMock = jest.mocked(getApiPetsId);
const notesMock = jest.mocked(getApiPetsPetIdNotes);
const patchMock = jest.mocked(patchApiPetsPetIdNotesNoteId);

const PET_ID = "11111111-1111-4111-8111-111111111111";
const NOTE_ID = "22222222-2222-4222-8222-222222222222";

const axiosOk = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const clients: QueryClient[] = [];

// One builder for every client here: without gcTime the mutation cache keeps a
// collection timer alive and a single-file run hangs instead of exiting, and a
// second hand-rolled client is how that drifted in the first place.
const makeClient = () => {
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
  return { queryClient, wrapper };
};

const renderPage = (seed?: (client: QueryClient) => void) => {
  const { queryClient, wrapper } = makeClient();
  // Seeded before render: setting it afterwards races the fetch the mount starts.
  seed?.(queryClient);
  return { ...render(<SingleNotePage />, { wrapper }), queryClient };
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

  it("shows the offline screen when offline with no cached notes", async () => {
    // Default networkMode "online": the query client never calls queryFn while
    // offline, it just sits paused — isError stays false, unlike a real
    // rejection. This is the case the "not found" redirect used to miss.
    onlineManager.setOnline(false);

    const { findByText } = renderPage();

    await findByText("offline.title");

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(notesMock).not.toHaveBeenCalled();
  });

  it("refetches and opens the note when Try again is pressed", async () => {
    const note = { id: NOTE_ID, petId: PET_ID, title: "Vet visit", content: "Bring the leash" };
    notesMock
      .mockImplementationOnce(() => Promise.reject(new Error("network down")))
      .mockResolvedValue(axiosOk([note]));

    const { findByText, findByDisplayValue, getByText } = renderPage();
    await findByText("errors.somethingWentWrong");

    fireEvent.press(getByText("errors.tryAgain"));

    await findByDisplayValue("Bring the leash");
    expect(notesMock).toHaveBeenCalledTimes(2);
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

  // A failed refetch keeps the cached data and still sets status "error", so guarding on
  // the error alone tore the editor down mid-edit — and the unmount fired its save into the
  // same bad network. Only the absence of data may replace the editor.
  it("keeps the editor on screen when a refetch fails over a warm cache", async () => {
    notesMock.mockImplementation(() => Promise.reject(new Error("network down")));
    const { queryClient, queryByText, getByPlaceholderText } = renderPage((client) =>
      client.setQueryData(notesQueryKeys.notes(PET_ID), [
        { id: NOTE_ID, petId: PET_ID, title: "Vet visit", content: "Bring vaccine record" },
      ])
    );

    // The observer notifies React asynchronously: without the flush the assertion
    // runs before the failure could have swapped the screen, and passes either way.
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: notesQueryKeys.notes(PET_ID) });
    });
    await act(async () => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    expect(getByPlaceholderText("pets:singleNotePage.untitled")).toBeTruthy();
    expect(queryByText("errors.somethingWentWrong")).toBeNull();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  // Leaving the editor fires the PATCH, and the cache still holds the pre-edit text until
  // it answers. Reopening in that window used to seed the editor from the stale cache, and
  // its next exit PATCHed that text back over the save.
  it("waits out a pending save instead of seeding the editor with the old text", async () => {
    const oldNote = { id: NOTE_ID, petId: PET_ID, title: "Vet visit", content: "old" };
    notesMock.mockResolvedValue(axiosOk([oldNote]));
    let settle = (_: AxiosResponse<unknown>) => undefined as void;
    patchMock.mockImplementation(
      () => new Promise((resolve) => (settle = resolve as typeof settle))
    );

    const { queryClient, wrapper } = makeClient();
    queryClient.setQueryData(notesQueryKeys.notes(PET_ID), [oldNote]);

    const { result } = renderHook(() => useUpdateNoteMutation(), { wrapper });
    // mutate starts mutationFn in a microtask, so the promise this test resolves
    // does not exist yet when mutate returns.
    await act(async () => {
      result.current.mutate({ petId: PET_ID, noteId: NOTE_ID, dto: { content: "new" } });
      await Promise.resolve();
    });

    const { queryByPlaceholderText, findByDisplayValue } = render(<SingleNotePage />, { wrapper });

    expect(queryByPlaceholderText("pets:singleNotePage.contentPlaceholder")).toBeNull();

    // The invalidate in onSuccess refetches, so the server has to answer with the save too.
    notesMock.mockResolvedValue(axiosOk([{ ...oldNote, content: "new" }]));
    await act(async () => {
      settle(axiosOk({ ...oldNote, content: "new" }));
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });

    await findByDisplayValue("new");
  });

  // Offline the same PATCH is paused rather than in flight, and waiting it out would mean
  // spinning for the whole offline episode. The queued save is covered by its own toast.
  it("still shows the editor when the pending save is only paused", async () => {
    const note = { id: NOTE_ID, petId: PET_ID, title: "Vet visit", content: "Bring the leash" };
    notesMock.mockResolvedValue(axiosOk([note]));
    onlineManager.setOnline(false);

    const { queryClient, wrapper } = makeClient();
    queryClient.setQueryData(notesQueryKeys.notes(PET_ID), [note]);

    const { result } = renderHook(() => useUpdateNoteMutation(), { wrapper });
    await act(async () => {
      result.current.mutate({ petId: PET_ID, noteId: NOTE_ID, dto: { content: "new" } });
      await Promise.resolve();
    });
    const [mutation] = queryClient.getMutationCache().getAll();
    expect(mutation?.state.isPaused).toBe(true);

    const { findByDisplayValue } = render(<SingleNotePage />, { wrapper });

    await findByDisplayValue("Bring the leash");
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
