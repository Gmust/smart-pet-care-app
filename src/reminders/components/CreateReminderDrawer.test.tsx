/// <reference types="jest" />

import { render } from "@testing-library/react-native";

import { ReminderType } from "@/api/generated";

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
  const { View } = require("react-native");
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    Select: passthrough,
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

jest.mock("../queries/useGetReminderById", () => ({
  useGetReminderById: () => ({ data: undefined }),
}));
jest.mock("../queries/useCreateRemindersMutation", () => ({
  useCreateRemindersMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock("../queries/useUpdateRemindersMutation", () => ({
  useUpdateRemindersMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
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
});
