import { act, renderHook } from "@testing-library/react-native";

import { useUndoRedoText } from "./useUndoRedoText";

const HISTORY_DEBOUNCE_MS = 500;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useUndoRedoText", () => {
  it("starts with the initial value and nothing to undo or redo", () => {
    const { result } = renderHook(() => useUndoRedoText("hello"));

    expect(result.current.value).toBe("hello");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("updates the live value immediately, before the checkpoint debounce fires", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("a"));

    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(false);
  });

  it("checkpoints once typing pauses, making the edit undoable", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("a"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));

    expect(result.current.canUndo).toBe(true);
  });

  it("undo and redo step between checkpoints", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("a"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));

    act(() => result.current.undo());
    expect(result.current.value).toBe("");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("does not insert a junk checkpoint when a pause lands back on the same value", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("a"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));
    act(() => result.current.undo());

    // Pausing back on the pre-edit value must not add a no-op step, or redo
    // would land on a duplicate "" instead of restoring "a".
    act(() => result.current.setValue(""));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));

    act(() => result.current.redo());
    expect(result.current.value).toBe("a");
    expect(result.current.canRedo).toBe(false);
  });
});
