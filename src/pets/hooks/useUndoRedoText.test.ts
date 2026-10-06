import { act, renderHook } from "@testing-library/react-native";

import { HISTORY_DEBOUNCE_MS, useUndoRedoText } from "./useUndoRedoText";

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

  it("undo while a checkpoint is pending returns to the last checkpoint", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("abc"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));
    act(() => result.current.setValue("abcdef")); // debounce still pending
    act(() => result.current.undo());

    expect(result.current.value).toBe("abc");
  });

  // Covers the slice(0, index + 1) in checkpoint: typing after an undo has to
  // drop the abandoned branch, or the next undo walks back into it.
  it("typing after an undo discards the redo branch", () => {
    const { result } = renderHook(() => useUndoRedoText(""));

    act(() => result.current.setValue("a"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));
    act(() => result.current.setValue("ab"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));
    act(() => result.current.undo()); // back to "a"
    act(() => result.current.setValue("aX"));
    act(() => jest.advanceTimersByTime(HISTORY_DEBOUNCE_MS));

    expect(result.current.canRedo).toBe(false);
    act(() => result.current.undo());
    expect(result.current.value).toBe("a");
    act(() => result.current.redo());
    expect(result.current.value).toBe("aX");
  });
});
