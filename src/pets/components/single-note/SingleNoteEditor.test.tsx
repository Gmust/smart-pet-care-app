/// <reference types="jest" />

import type { ComponentProps, ReactNode } from "react";
import Toast from "react-native-toast-message";
import { PortalHost } from "@rn-primitives/portal";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// getApiErrorMessage translates through the global instance, not the hook.
jest.mock("i18next", () => ({
  __esModule: true,
  default: { t: (key: string) => mockTranslate(key) },
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/api", () => ({
  postApiPetsPetIdNotes: jest.fn(),
  patchApiPetsPetIdNotesNoteId: jest.fn(),
  deleteApiPetsPetIdNotesNoteId: jest.fn(),
}));

import {
  deleteApiPetsPetIdNotesNoteId,
  patchApiPetsPetIdNotesNoteId,
  postApiPetsPetIdNotes,
} from "@/api";
import { notesQueryKeys } from "@/pets/queries/notes/notesQueryKeys";

import { SingleNoteEditor } from "./SingleNoteEditor";

const createMock = jest.mocked(postApiPetsPetIdNotes);
const updateMock = jest.mocked(patchApiPetsPetIdNotesNoteId);
const deleteMock = jest.mocked(deleteApiPetsPetIdNotesNoteId);
const toastMock = jest.mocked(Toast.show);

const PET_ID = "pet-1";
const NOTE_ID = "note-1";

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const clients: QueryClient[] = [];

type EditorProps = ComponentProps<typeof SingleNoteEditor>;

const renderEditor = (props: Partial<EditorProps> = {}) => {
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
  return {
    ...render(
      <>
        <SingleNoteEditor
          petId={PET_ID}
          petName="Miso"
          initialTitle=""
          initialContent=""
          {...props}
        />
        <PortalHost name="dialog" />
      </>,
      { wrapper }
    ),
    queryClient,
  };
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients.splice(0)) {
    client.clear();
  }
  jest.restoreAllMocks();
});

describe("SingleNoteEditor save-on-exit", () => {
  it("creates a note when only the title is filled", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "new-note" }));
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");

    await act(async () => unmount());

    expect(createMock).toHaveBeenCalledWith(PET_ID, { title: "Vet visit", content: "" });
  });

  it("does nothing for a new, untouched note", async () => {
    const { unmount } = renderEditor();

    await act(async () => unmount());

    expect(createMock).not.toHaveBeenCalled();
  });

  it("deletes an existing note when cleared to empty", async () => {
    deleteMock.mockResolvedValue(apiResponse(undefined));
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "");
    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.contentPlaceholder"), "");

    await act(async () => unmount());

    expect(deleteMock).toHaveBeenCalledWith(PET_ID, NOTE_ID);
  });

  it("does nothing for an existing note left unchanged", async () => {
    const { unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    await act(async () => unmount());

    expect(updateMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("updates an existing note when edited", async () => {
    updateMock.mockResolvedValue(apiResponse({ id: NOTE_ID }));
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.changeText(
      getByPlaceholderText("pets:singleNotePage.contentPlaceholder"),
      "Bring vaccine record and leash"
    );

    await act(async () => unmount());

    expect(updateMock).toHaveBeenCalledWith(PET_ID, NOTE_ID, {
      content: "Bring vaccine record and leash",
    });
  });

  it("only sends the title when just the title is edited", async () => {
    updateMock.mockResolvedValue(apiResponse({ id: NOTE_ID }));
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet checkup");

    await act(async () => unmount());

    expect(updateMock).toHaveBeenCalledWith(PET_ID, NOTE_ID, {
      title: "Vet checkup",
    });
  });

  it("does not PATCH when a refetch changes the note under an untouched editor", async () => {
    updateMock.mockResolvedValue(apiResponse({ id: NOTE_ID }));
    const existing = { noteId: NOTE_ID, initialTitle: "Vet visit", initialContent: "old" };
    const { rerender, unmount } = renderEditor(existing);

    // The notes refetch lands: same note, newer server content.
    rerender(
      <SingleNoteEditor
        petId={PET_ID}
        petName="Miso"
        {...existing}
        initialContent="saved a moment ago"
      />
    );
    await act(async () => unmount());

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("shows an error toast when the autosave PATCH fails", async () => {
    updateMock.mockImplementation(() => Promise.reject(new Error("network down")));
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "old",
    });

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.contentPlaceholder"), "new");
    await act(async () => unmount());
    await act(async () => new Promise<void>((resolve) => setTimeout(resolve, 20)));

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
  });

  it("shows an error toast when the autosave POST fails", async () => {
    createMock.mockImplementation(() => Promise.reject(new Error("network down")));
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");
    await act(async () => unmount());
    await act(async () => new Promise<void>((resolve) => setTimeout(resolve, 20)));

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
  });

  it("shows an error toast when the auto-delete fails", async () => {
    deleteMock.mockImplementation(() => Promise.reject(new Error("network down")));
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "");
    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.contentPlaceholder"), "");
    await act(async () => unmount());
    await act(async () => new Promise<void>((resolve) => setTimeout(resolve, 20)));

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
  });

  it("shows an error toast and keeps the dialog open when the explicit delete fails", async () => {
    deleteMock.mockImplementation(() => Promise.reject(new Error("network down")));
    const { getByLabelText, getByText } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.press(getByLabelText("pets:singleNotePage.deleteA11y"));
    await act(async () => {
      fireEvent.press(getByText("common:deleteDialog.confirm"));
    });

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
    expect(mockBack).not.toHaveBeenCalled();
    // Dialog stayed open for a retry: the confirm button is still on screen.
    expect(getByText("common:deleteDialog.confirm")).toBeTruthy();
  });

  // The invalidation sits in the hook's onSuccess, which runs off the Mutation
  // rather than this screen's observer, so it survives the unmount that triggered
  // the save. Per-call it would stop firing, hiding the note for staleTime's hour.
  it("invalidates the notes list when a save resolves after unmount", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "new-note" }));
    const { getByPlaceholderText, unmount, queryClient } = renderEditor();
    queryClient.setQueryData(notesQueryKeys.notes(PET_ID), []);

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");
    await act(async () => unmount());
    await act(async () => new Promise<void>((resolve) => setTimeout(resolve, 20)));

    expect(queryClient.getQueryState(notesQueryKeys.notes(PET_ID))?.isInvalidated).toBe(true);
  });

  it("does not create a note when the only input is whitespace", async () => {
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "   ");
    await act(async () => unmount());

    expect(createMock).not.toHaveBeenCalled();
  });

  // Offline, React Query pauses the mutation instead of failing it, so nothing
  // else tells the user the note has not reached the server yet. Without this
  // they retype it, and every attempt lands as its own note on reconnect.
  it("says the save is queued when offline, and still queues it", async () => {
    onlineManager.setOnline(false);
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");
    await act(async () => unmount());

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ text1: "pets:singleNotePage.offlineQueued" })
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("stays quiet about the connection when online", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "new-note" }));
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");
    await act(async () => unmount());

    expect(toastMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ text1: "pets:singleNotePage.offlineQueued" })
    );
  });

  it("does not treat added trailing whitespace as an edit", async () => {
    const { getByPlaceholderText, unmount } = renderEditor({
      noteId: NOTE_ID,
      initialTitle: "Vet visit",
      initialContent: "Bring vaccine record",
    });

    fireEvent.changeText(
      getByPlaceholderText("pets:singleNotePage.contentPlaceholder"),
      "Bring vaccine record   "
    );
    await act(async () => unmount());

    expect(updateMock).not.toHaveBeenCalled();
  });
});
