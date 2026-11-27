/// <reference types="jest" />

import type { ReactNode } from "react";
import { render } from "@testing-library/react-native";

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({ useRouter: () => ({ back: mockBack, replace: mockReplace }) }));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children?: ReactNode }) => children,
}));

type DrawerProps = {
  setIsOpen: (open: boolean) => void;
  onCreated: (pet: { id: string }) => void;
};
let drawerProps: DrawerProps | undefined;

jest.mock("@/pets/components/actions/CreatePetDrawer", () => ({
  CreatePetDrawer: (props: DrawerProps) => {
    drawerProps = props;
    return null;
  },
}));

import AssistantNewPetPage from "./AssistantNewPetPage";

describe("AssistantNewPetPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    drawerProps = undefined;
  });

  it("goes back once when the drawer reports the same close twice", () => {
    render(<AssistantNewPetPage />);

    drawerProps?.setIsOpen(false);
    drawerProps?.setIsOpen(false);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("does not go back after a pet was created, and opens the assistant for it", () => {
    render(<AssistantNewPetPage />);

    drawerProps?.onCreated({ id: "pet-1" });
    drawerProps?.setIsOpen(false);

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/(tabs)/assistant",
      params: { petId: "pet-1" },
    });
  });
});
