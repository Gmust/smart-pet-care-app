/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("reports the opposite of its state when pressed", () => {
    const onCheckedChange = jest.fn();
    const utils = render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} accessibilityLabel="Accept" />
    );

    fireEvent.press(utils.getByRole("checkbox", { name: "Accept" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reports unchecked when a checked box is pressed", () => {
    const onCheckedChange = jest.fn();
    const utils = render(
      <Checkbox checked onCheckedChange={onCheckedChange} accessibilityLabel="Accept" />
    );

    fireEvent.press(utils.getByRole("checkbox", { name: "Accept" }));

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("exposes its state to assistive tech", () => {
    const utils = render(
      <Checkbox checked onCheckedChange={jest.fn()} accessibilityLabel="Accept" />
    );

    expect(utils.getByRole("checkbox", { name: "Accept" })).toBeChecked();
  });

  it("ignores presses while disabled", () => {
    const onCheckedChange = jest.fn();
    const utils = render(
      <Checkbox
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
        accessibilityLabel="Accept"
      />
    );

    fireEvent.press(utils.getByRole("checkbox", { name: "Accept" }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
