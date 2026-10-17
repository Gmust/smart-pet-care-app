/// <reference types="jest" />

import { StyleSheet } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { Tabs } from "./tabs";

const ITEMS = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
];

const layoutEvent = (x: number, width: number) => ({
  nativeEvent: { layout: { x, y: 0, width, height: 40 } },
});

describe("Tabs indicator", () => {
  it("sits under the active tab once the tabs are measured, and follows a change of tab", () => {
    const view = render(<Tabs items={ITEMS} value="one" onChange={jest.fn()} />);

    fireEvent(view.getByText("One"), "layout", layoutEvent(20, 80));
    fireEvent(view.getByText("Two"), "layout", layoutEvent(100, 120));

    const indicatorStyle = () => StyleSheet.flatten(view.getByTestId("tabs-indicator").props.style);
    expect(indicatorStyle()).toMatchObject({ left: 20, width: 80 });

    view.rerender(<Tabs items={ITEMS} value="two" onChange={jest.fn()} />);
    expect(indicatorStyle()).toMatchObject({ left: 100, width: 120 });
  });

  it("draws no indicator before anything is measured", () => {
    const view = render(<Tabs items={ITEMS} value="one" onChange={jest.fn()} />);

    expect(view.queryByTestId("tabs-indicator")).toBeNull();
  });

  it("slides under the active chip too, and reports the chip that was pressed", () => {
    const onChange = jest.fn();
    const view = render(<Tabs variant="chips" items={ITEMS} value="two" onChange={onChange} />);

    fireEvent(view.getByText("One"), "layout", layoutEvent(0, 60));
    fireEvent(view.getByText("Two"), "layout", layoutEvent(68, 72));

    expect(StyleSheet.flatten(view.getByTestId("tabs-indicator").props.style)).toMatchObject({
      left: 68,
      width: 72,
    });

    fireEvent.press(view.getByText("One"));
    expect(onChange).toHaveBeenCalledWith("one");
  });
});

describe("Tabs selection", () => {
  it.each(["segmented", "pill", "chips"] as const)(
    "tells assistive tech which %s item is current, and only that one",
    (variant) => {
      const view = render(
        <Tabs variant={variant} items={ITEMS} value="two" onChange={jest.fn()} />
      );

      expect(view.getByRole("tab", { name: "Two", selected: true })).toBeTruthy();
      expect(view.getByRole("tab", { name: "One", selected: false })).toBeTruthy();
    }
  );
});
