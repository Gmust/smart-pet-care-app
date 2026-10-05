/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

import { getApiPetsPetIdNotes, patchApiPetsPetIdNotesNoteId } from "@/api";
import type { NoteResponseDto } from "@/api/generated";

import { EMPTY_NOTE_FIELD } from "./noteFieldSentinel";
import { notesQueryKeys } from "./notesQueryKeys";
import { useNotesQuery } from "./useNotesQuery";
import { useUpdateNoteMutation } from "./useUpdateNoteMutation";

jest.mock("@/api", () => ({
  getApiPetsPetIdNotes: jest.fn(),
  patchApiPetsPetIdNotesNoteId: jest.fn(),
}));

const listMock = jest.mocked(getApiPetsPetIdNotes);
const updateMock = jest.mocked(patchApiPetsPetIdNotesNoteId);

const PET_ID = "pet-1";
const NOTE_ID = "note-1";

const note: NoteResponseDto = {
  id: NOTE_ID,
  petId: PET_ID,
  title: "Vet visit",
  content: "Bring vaccine record",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

const axiosOk = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: { headers: new AxiosHeaders() },
});

const clients: QueryClient[] = [];

const createWrapper = () => {
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

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Without this a cached query keeps React Query's notify timer alive and jest
  // never exits (the suite hangs rather than failing).
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("useNotesQuery", () => {
  it("decodes the sentinel back to an empty string for both fields", async () => {
    const sentinelNote = { ...note, title: EMPTY_NOTE_FIELD, content: EMPTY_NOTE_FIELD };
    listMock.mockResolvedValue(axiosOk([sentinelNote]));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useNotesQuery(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ ...sentinelNote, title: "", content: "" }]);
  });
});

describe("useUpdateNoteMutation", () => {
  it("writes the saved note into the list cache, so a reopen sees it before the refetch", async () => {
    const saved = { ...note, content: "Bring vaccine record and leash" };
    updateMock.mockResolvedValue(axiosOk(saved));
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(notesQueryKeys.notes(PET_ID), [note]);

    const { result } = renderHook(() => useUpdateNoteMutation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        petId: PET_ID,
        noteId: NOTE_ID,
        dto: { content: saved.content },
      });
    });

    expect(queryClient.getQueryData(notesQueryKeys.notes(PET_ID))).toEqual([saved]);
  });

  it("decodes the sentinel before caching, so a cleared field is not an invisible character", async () => {
    updateMock.mockResolvedValue(axiosOk({ ...note, content: EMPTY_NOTE_FIELD }));
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(notesQueryKeys.notes(PET_ID), [note]);

    const { result } = renderHook(() => useUpdateNoteMutation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        petId: PET_ID,
        noteId: NOTE_ID,
        dto: { content: EMPTY_NOTE_FIELD },
      });
    });

    expect(queryClient.getQueryData<NoteResponseDto[]>(notesQueryKeys.notes(PET_ID))).toEqual([
      { ...note, content: "" },
    ]);
  });
});
