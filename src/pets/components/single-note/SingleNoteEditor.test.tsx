/// <reference types="jest" />

import type { ComponentProps, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
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
import { EMPTY_NOTE_FIELD } from "@/pets/queries/notes/noteFieldSentinel";

import { SingleNoteEditor } from "./SingleNoteEditor";

const createMock = jest.mocked(postApiPetsPetIdNotes);
const updateMock = jest.mocked(patchApiPetsPetIdNotesNoteId);
const deleteMock = jest.mocked(deleteApiPetsPetIdNotesNoteId);

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
  return render(
    <SingleNoteEditor petId={PET_ID} petName="Miso" initialTitle="" initialContent="" {...props} />,
    { wrapper }
  );
};

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("SingleNoteEditor save-on-exit", () => {
  it("creates a note when only the title is filled", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "new-note" }));
    const { getByPlaceholderText, unmount } = renderEditor();

    fireEvent.changeText(getByPlaceholderText("pets:singleNotePage.untitled"), "Vet visit");

    await act(async () => unmount());

    expect(createMock).toHaveBeenCalledWith(PET_ID, {
      title: "Vet visit",
      content: EMPTY_NOTE_FIELD,
    });
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
      title: "Vet visit",
      content: "Bring vaccine record and leash",
    });
  });
});
