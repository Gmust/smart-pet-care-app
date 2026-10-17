/// <reference types="jest" />

import { BackHandler } from "react-native";
import { renderHook } from "@testing-library/react-native";

import { useBackToOrigin } from "./useBackToOrigin";

const mockBack = jest.fn();
const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");

  return {
    useRouter: () => ({ back: mockBack, navigate: mockNavigate, canGoBack: mockCanGoBack }),
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  mockCanGoBack.mockReturnValue(true);
});

describe("useBackToOrigin", () => {
  it("pops the pets stack, then shows the tab the screen came from", () => {
    const { result } = renderHook(() => useBackToOrigin("home"));

    result.current?.();

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/(tabs)/home");
    expect(mockBack.mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0] ?? 0
    );
  });

  it("does not try to pop a stack that has nothing to pop", () => {
    mockCanGoBack.mockReturnValue(false);
    const { result } = renderHook(() => useBackToOrigin("home"));

    result.current?.();

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/(tabs)/home");
  });

  it("leaves back alone for a screen opened from inside the pets stack", () => {
    const addListener = jest.spyOn(BackHandler, "addEventListener");
    const { result } = renderHook(() => useBackToOrigin(undefined));

    expect(result.current).toBeUndefined();
    expect(addListener).not.toHaveBeenCalled();
  });

  it("takes over the system back button while the screen is focused", () => {
    let onHardwareBack: () => boolean | null | undefined = () => false;
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_event, handler) => {
      onHardwareBack = handler;
      return { remove: jest.fn() };
    });
    renderHook(() => useBackToOrigin("home"));

    expect(onHardwareBack()).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith("/(tabs)/home");
  });

  it("gives the system back button back once the screen is gone", () => {
    const remove = jest.fn();
    jest.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove });
    const { unmount } = renderHook(() => useBackToOrigin("home"));

    expect(remove).not.toHaveBeenCalled();

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
