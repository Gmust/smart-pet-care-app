/// <reference types="jest" />

import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { type HealthRecordResponseDto, HealthRecordType, SymptomType } from "@/api/generated";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

// The drawer primitives wrap @gorhom/bottom-sheet, which needs the real
// Reanimated at import time; this test is about the form, not the sheet.
jest.mock("@/shadecn/ui/drawer", () => {
  // No JSX in jest.mock factories — see CLAUDE.md.
  const React = require("react");
  const { View } = require("react-native");
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    Drawer: passthrough,
    DrawerContent: passthrough,
    DrawerHeader: passthrough,
    DrawerTitle: passthrough,
    DrawerFooter: passthrough,
    DrawerScrollView: passthrough,
    DrawerCloseButton: () => null,
    useDrawerNativeActivity: () => () => undefined,
    useDrawerSetOpen: () => () => undefined,
    useDrawerClose: () => () => undefined,
    DRAWER_FOOTER_FADE_SPACING: 30,
  };
});

jest.mock("@/pets/queries/usePetsQuery", () => ({
  usePetsQuery: () => ({ data: [{ id: "pet-1", name: "Rex" }], isLoading: false }),
}));

jest.mock("../../queries/useSymptomsQuery", () => ({
  useSymptomsQuery: () => ({ data: [{ id: "s-1", name: "Fever", label: "Fever" }] }),
}));

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
jest.mock("../../queries/useCreateHealthRecordMutation", () => ({
  useCreateHealthRecordMutation: () => ({ mutateAsync: mockCreate, isPending: false }),
}));
jest.mock("../../queries/useUpdateHealthRecordMutation", () => ({
  useUpdateHealthRecordMutation: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

import { AddHealthRecordDrawer } from "./AddHealthRecordDrawer";

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockImplementation(() => Promise.resolve({}));
});

describe("AddHealthRecordDrawer", () => {
  it("collects symptoms and notes for a Symptom record, not a next-due date", () => {
    const { getByText, queryByText } = render(
      <AddHealthRecordDrawer
        petId="pet-1"
        type={HealthRecordType.Symptom}
        isOpen
        setIsOpen={jest.fn()}
      />
    );

    expect(getByText("health:forms.healthRecord.fields.symptoms")).toBeTruthy();
    expect(getByText("health:forms.healthRecord.fields.description")).toBeTruthy();
    expect(getByText("Fever")).toBeTruthy();
    expect(queryByText("health:forms.healthRecord.fields.nextDueAt")).toBeNull();
  });

  it("edits a record without offering or sending a type change", async () => {
    const record: HealthRecordResponseDto = {
      id: "record-1",
      petId: "pet-1",
      type: HealthRecordType.Symptom,
      title: "Hot nose",
      performedAt: "2026-09-20T09:00:00.000Z",
      symptoms: [SymptomType.Fever],
    };

    const { getByText, queryByText } = render(
      <AddHealthRecordDrawer record={record} isOpen setIsOpen={jest.fn()} />
    );

    expect(queryByText("health:forms.healthRecord.fields.type")).toBeNull();
    expect(queryByText("health:forms.healthRecord.fields.pet")).toBeNull();

    fireEvent.press(getByText("health:forms.healthRecord.submit"));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    const { dto } = mockUpdate.mock.calls[0][0];
    // PATCH semantics: an omitted key is left unchanged, so the type can't drift.
    expect(dto).not.toHaveProperty("type");
    expect(dto.symptoms).toEqual([SymptomType.Fever]);
  });
});
