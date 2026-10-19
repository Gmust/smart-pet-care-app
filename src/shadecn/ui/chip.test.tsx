/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import { Chip } from "./chip";

describe("Chip", () => {
  it("is a plain label, not a button, when it has no action", () => {
    const screen = render(<Chip label="46%" />);

    expect(screen.getByText("46%")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is a button that runs its action when it has one", () => {
    const onPress = jest.fn();
    const screen = render(<Chip label="Dry food" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Dry food" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
