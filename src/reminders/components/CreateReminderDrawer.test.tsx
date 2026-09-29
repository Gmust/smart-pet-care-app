/// <reference types="jest" />

import { fireEvent, render, waitFor } from "@testing-library/react-native";

import type { ReminderResponseDto } from "@/api/generated";
import { RecalcStrategy, ReminderType, RepeatType } from "@/api/generated";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

// The drawer primitives wrap @gorhom/bottom-sheet, which needs the real
// Reanimated at import time; this test is about form state, not the sheet.
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

// The select primitive needs a portal host; the pet picker is not under test.
jest.mock("@/shadecn/ui/select", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    // Shows the selected option, so a test can see what the form preselected.
    Select: ({ children, value }: { children?: React.ReactNode; value?: { label: string } }) =>
      React.createElement(
        View,
        null,
        value ? React.createElement(Text, null, `selected:${value.label}`) : null,
        children
      ),
    SelectContent: passthrough,
    SelectItem: () => null,
    SelectTrigger: passthrough,
    SelectValue: () => null,
  };
});

const mockPets = jest.fn();
jest.mock("@/pets/queries/usePetsQuery", () => ({
  usePetsQuery: () => mockPets(),
}));

const mockReminder = jest.fn((): ReminderResponseDto | undefined => undefined);
jest.mock("../queries/useGetReminderById", () => ({
  useGetReminderById: () => ({ data: mockReminder() }),
}));
jest.mock("../queries/useCreateRemindersMutation", () => ({
  useCreateRemindersMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
const mockUpdate = jest.fn();
jest.mock("../queries/useUpdateRemindersMutation", () => ({
  useUpdateRemindersMutation: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

import { CreateReminderDrawer } from "./CreateReminderDrawer";

const PET = { id: "pet-1", name: "Rex" };

const initialValues = {
  petId: PET.id,
  type: ReminderType.Medication,
  title: "Give heartworm pill",
  description: "Suggested by wellness",
};

describe("CreateReminderDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps pre-filled values when the drawer re-renders", () => {
    mockPets.mockReturnValue({ data: [PET], isLoading: false });
    const setIsOpen = jest.fn();

    const { getByDisplayValue, rerender } = render(
      <CreateReminderDrawer isOpen setIsOpen={setIsOpen} initialValues={initialValues} />
    );
    expect(getByDisplayValue(initialValues.title)).toBeTruthy();

    // A pets refetch is the everyday trigger: new query result, same props.
    mockPets.mockReturnValue({ data: [{ ...PET }], isLoading: false });
    rerender(<CreateReminderDrawer isOpen setIsOpen={setIsOpen} initialValues={initialValues} />);

    expect(getByDisplayValue(initialValues.title)).toBeTruthy();
    expect(getByDisplayValue(initialValues.description)).toBeTruthy();
  });

  it("preselects the pet it was opened for", () => {
    // From a pet's profile the reminder is for that pet; making the user pick
    // it again was an extra step, and a flow that skipped it could not save.
    const pet = { id: "0b7f2d8e-4c1a-4d2e-9f3a-1b2c3d4e5f60", name: "Rex" };
    mockPets.mockReturnValue({ data: [pet], isLoading: false });

    const { getByText } = render(
      <CreateReminderDrawer petId={pet.id} isOpen setIsOpen={jest.fn()} />
    );

    expect(getByText("selected:Rex")).toBeTruthy();
  });

  describe("edit mode", () => {
    // The form validates petId as a UUID, so "pet-1" would never submit.
    const pet = { id: "0b7f2d8e-4c1a-4d2e-9f3a-1b2c3d4e5f60", name: "Rex" };
    const reminder: ReminderResponseDto = {
      id: "rem-1",
      petId: pet.id,
      title: "Give pill",
      description: "With food",
      type: ReminderType.Medication,
      repeatType: RepeatType.Daily,
      intervalN: 1,
      recalcStrategy: RecalcStrategy.Calendar,
      days: [],
      date: null,
      timeOfDay: "08:00:00",
      nextTriggerAt: "2026-10-01T08:00:00Z",
      endAt: null,
    };

    const renderEdit = () => {
      mockPets.mockReturnValue({ data: [pet], isLoading: false });
      mockReminder.mockReturnValue(reminder);
      mockUpdate.mockResolvedValue(reminder);
      const setIsOpen = jest.fn();
      const utils = render(
        <CreateReminderDrawer isOpen setIsOpen={setIsOpen} reminderId="rem-1" />
      );
      return { ...utils, setIsOpen };
    };

    it("sends only the field the user changed", async () => {
      const { getByDisplayValue, getByText } = renderEdit();
      fireEvent.changeText(getByDisplayValue("Give pill"), "Give pill twice");
      fireEvent.press(getByText("reminders:editReminderDrawer.submit"));

      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith({
          id: "rem-1",
          payload: { title: "Give pill twice" },
        })
      );
    });

    it("does not send back a field another device changed after the form opened", async () => {
      // PATCH semantics: anything sent overwrites. The refetched description
      // is newer than the form's copy and was not touched here.
      const { getByDisplayValue, getByText, rerender } = renderEdit();
      mockReminder.mockReturnValue({ ...reminder, description: "Changed elsewhere" });
      rerender(<CreateReminderDrawer isOpen setIsOpen={jest.fn()} reminderId="rem-1" />);

      fireEvent.changeText(getByDisplayValue("Give pill"), "Give pill twice");
      fireEvent.press(getByText("reminders:editReminderDrawer.submit"));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "rem-1",
        payload: { title: "Give pill twice" },
      });
    });

    it("saves nothing when nothing changed", async () => {
      const { getByText, setIsOpen } = renderEdit();
      fireEvent.press(getByText("reminders:editReminderDrawer.submit"));

      await waitFor(() => expect(setIsOpen).toHaveBeenCalledWith(false));
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
